"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import useFetch from "@/hooks/use-fetch";

import statuses from "@/data/status";
import { getIssuesForSprint, updateIssueOrder } from "@/actions/issues";

import SprintManager from "./sprint-manager";
import IssueCreationDrawer from "./create-issue";
import IssueCard from "@/components/issue-card";
import BoardFilters from "./board-filters";

// 拖拽card在同一个column中，会改变issue在column中的顺序，移除startIndex即原始位置的元素，插入到endIndex即最终位置
function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);  ////浅复制原来的column的issue 数组
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}

export default function SprintBoard({ sprints, projectId, orgId }) {
    // 当前sprint
    const [currentSprint, setCurrentSprint] = useState(
        sprints.find((spr) => spr.status === "ACTIVE") || sprints[0]
    );

    // 抽屉是否打开
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // 选中的状态
    const [selectedStatus, setSelectedStatus] = useState(null);

    // 获取issues
    const {
        loading: issuesLoading,
        error: issuesError,
        fn: fetchIssues,
        data: issues,
        setData: setIssues,
    } = useFetch(getIssuesForSprint);

    // 过滤后的issues，维护一个独立的filteredIssues状态可以保持原始数据的完整性，同时允许用户界面根据过滤条件动态更新。
    const [filteredIssues, setFilteredIssues] = useState(issues);

    // 过滤条件改变
    const handleFilterChange = (newFilteredIssues) => {
        setFilteredIssues(newFilteredIssues);
    };

    //sprint改变，需要重新获取issues
    useEffect(() => {
        if (currentSprint.id) {
            fetchIssues(currentSprint.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSprint.id]);

    // 添加issue
    const handleAddIssue = (status) => {
        setSelectedStatus(status);
        setIsDrawerOpen(true);
    };

    // 创建了issue之后，需要重新获取issues
    const handleIssueCreated = () => {
        fetchIssues(currentSprint.id);
    };

    // 发起更新issue顺序（拖拽issue导致的）请求
    const {
        fn: updateIssueOrderFn,
        loading: updateIssuesLoading,
        error: updateIssuesError,
    } = useFetch(updateIssueOrder);

    //处理拖拽结束
    const onDragEnd = async (result) => {
        //条件检查
        if (currentSprint.status === "PLANNED") {
            toast.warning("开启冲刺以更新面板！");
            return;
        }
        if (currentSprint.status === "COMPLETED") {
            toast.warning("冲刺结束后不能更新面板！");
            return;
        }
        const { destination, source } = result;

        if (!destination) {
            return;
        }

        if (
            //拖拽，但是放在了原来的位置
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // 创建issues的浅拷贝用于本地状态更新（避免直接修改原状态）
        const newOrderedData = [...issues];

        // 获取源列和目标列的引用（注意：此处是浅拷贝后的数据）
        const sourceList = newOrderedData.filter(
            (list) => list.status === source.droppableId
        );

        const destinationList = newOrderedData.filter(
            (list) => list.status === destination.droppableId
        );

        
        if (source.droppableId === destination.droppableId) {
            // 同列排序逻辑
            const reorderedCards = reorder(sourceList, source.index, destination.index);
            reorderedCards.forEach((card, i) => {
                card.order = i;
            });
        } else {

            // 跨列拖拽逻辑：
            // 1. 从源列移除卡片 
            // remove card from the source list，movedCard是拖拽的issue
            const [movedCard] = sourceList.splice(source.index, 1);

            //2. 更新卡片状态 
            movedCard.status = destination.droppableId;

            //3. 插入到目标列
            destinationList.splice(destination.index, 0, movedCard);

            //4. 重新计算两列中每个issue的order
            sourceList.forEach((card, i) => {
                card.order = i;
            });

            destinationList.forEach((card, i) => {
                card.order = i;
            });
        }

        // 对数据进行全局排序并更新状态，虽然每个issue的order属性已经更新，但需要重新根据它们的order全局排序
        const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
        // setIssues(newOrderedData, sortedIssues);
        setIssues(sortedIssues);

        //后端响应更新顺序
        updateIssueOrderFn(sortedIssues);
    };

    //issues加载错误
    if (issuesError) return <div>加载问题出错！</div>;

    return (
        <div className="flex flex-col">
            {/* sprint管理 */}
            <SprintManager
                sprint={currentSprint}
                setSprint={setCurrentSprint}
                sprints={sprints}
                projectId={projectId}
            />

            {/* 筛选符合条件的issue */}
            {issues && !issuesLoading && (
                <BoardFilters issues={issues} onFilterChange={handleFilterChange} />
            )}

            {/* 显示更新issue顺序的错误 */}
            {updateIssuesError && (
                <p className="text-red-500 mt-2">{updateIssuesError.message}</p>
            )}

            {/* 加载issues、更新issue顺序未完成时，显示进度条 */}
            {(updateIssuesLoading || issuesLoading) && (
                <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
            )}

            {/* 看板 */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
                    {statuses.map((column) => (
                        <Droppable key={column.key} droppableId={column.key}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    <h3 className="font-semibold mb-2 text-center">
                                        {column.name}
                                    </h3>

                                    {/* Issue */}

                                    {/* 遍历每个column对应的issue（经过过滤的） */}
                                    {filteredIssues  
                                        ?.filter((issue) => issue.status === column.key)
                                        .map((issue, index) => (
                                            <Draggable
                                                key={issue.id}
                                                draggableId={issue.id}
                                                index={index}
                                                isDragDisabled={updateIssuesLoading}  //在更新issues过程中不允许再拖拽
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        {/* IssueCard展示每个issue */}
                                                        <IssueCard
                                                            issue={issue}
                                                            // 删除操作重新获取数据，结构性变动（移除条目）,因此重新获取所有数据。
                                                            onDelete={() => fetchIssues(currentSprint.id)}
                                                            // 更新操作直接替换本地状态，局部变动（修改字段），直接替换本地对应条目，优化性能并实现即时反馈。
                                                            onUpdate={(updated) =>
                                                                setIssues((issues) =>
                                                                    issues.map((issue) => {
                                                                        if (issue.id === updated.id) return updated;
                                                                        return issue;
                                                                    })
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                    {column.key === "TODO" &&
                                        currentSprint.status !== "COMPLETED" && (
                                            <Button
                                                variant="ghost"
                                                className="w-full"
                                                onClick={() => handleAddIssue(column.key)}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                创建问题
                                            </Button>
                                        )}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            <IssueCreationDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                sprintId={currentSprint.id}
                status={selectedStatus}
                projectId={projectId}
                onIssueCreated={handleIssueCreated}
                orgId={orgId}
            />
        </div>
    );
}
