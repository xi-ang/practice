"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { BarLoader } from "react-spinners";
import { formatDistanceToNow, isAfter, isBefore, format } from "date-fns";

import useFetch from "@/hooks/use-fetch";
import { useRouter, useSearchParams } from "next/navigation";

import { updateSprintStatus } from "@/actions/sprints";

export default function SprintManager({
    sprint,
    setSprint,
    sprints,
    projectId,
}) {
    // 本地状态：用于跟踪当前冲刺的状态（与父组件传递的 sprint.status 初始化同步）
    const [status, setStatus] = useState(sprint.status);
    const router = useRouter();
    const searchParams = useSearchParams();
    // console.log("searchParams.sprint:", searchParams.get("sprint"));

    // 处理状态更新的异步操作（通过自定义 useFetch 钩子）
    const {
        fn: updateStatus,
        loading,
        error,
        data: updatedStatus,
    } = useFetch(updateSprintStatus);

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const now = new Date();

    const canStart =
        isBefore(now, endDate) && isAfter(now, startDate) && status === "PLANNED";

    const canEnd = status === "ACTIVE";

    // 当通过按钮更新状态后，后端调整为新状态
    const handleStatusChange = async (newStatus) => {
        updateStatus(sprint.id, newStatus);
    };

    // 当通过按钮更新状态后，响应后端返回的新状态
    useEffect(() => {
        if (updatedStatus && updatedStatus.success) {
            // 更新本地状态
            setStatus(updatedStatus.sprint.status);
            // 更新父组件的当前冲刺数据（保持父子状态同步）
            setSprint({
                ...sprint,
                status: updatedStatus.sprint.status,
            });
        }
    }, [updatedStatus, loading]);

    // 根据状态返回相应的文本
    const getStatusText = () => {
        // 如果状态为已完成
        if (status === "COMPLETED") {
            // 返回冲刺已结束
            return `冲刺已结束`;
        }
        // 如果状态为进行中且当前时间晚于结束时间
        if (status === "ACTIVE" && isAfter(now, endDate)) {
            // 返回冲刺已逾期，并计算逾期时间
            return `冲刺已逾期${formatDistanceToNow(endDate)}`;
        }
        // 如果状态为计划中且当前时间早于开始时间
        if (status === "PLANNED" && isBefore(now, startDate)) {
            // 返回距离冲刺开始还有，并计算开始时间
            return `距离冲刺开始还有${formatDistanceToNow(startDate)}`;
        }
        // 其他情况返回null
        return null;
    };


    // 当URL中的sprint参数或sprints列表变化时，更新当前选中的冲刺（sprint）及其状态。
    // URL中的sprint参数变化可能来自外部导航，外部链接或手动输入
    useEffect(() => {
        const sprintId = searchParams.get("sprint");
        if (sprintId && sprintId !== sprint.id) {
            // console.log("执行了！");
            const selectedSprint = sprints.find((s) => s.id === sprintId);
            if (selectedSprint) {
                setSprint(selectedSprint);
                setStatus(selectedSprint.status);
            }
        }
    }, [searchParams, sprints]);

    // 处理下拉框切换冲刺
    const handleSprintChange = (value) => {
        const selectedSprint = sprints.find((s) => s.id === value);
        setSprint(selectedSprint);  // 更新父组件的当前冲刺
        setStatus(selectedSprint.status);  // 同步本地状态
        router.replace(`/project/${projectId}`, undefined, { shallow: true });
       
    };

    return (
        <>
            <div className="flex justify-between items-center gap-4">
                <Select value={sprint.id} onValueChange={handleSprintChange} className="">
                    <SelectTrigger className="bg-slate-950 self-start">
                        <SelectValue placeholder="选择冲刺" />
                    </SelectTrigger>
                    <SelectContent>
                        {sprints.map((sprint) => (
                            <SelectItem key={sprint.id} value={sprint.id}>
                                {sprint.name} ({format(sprint.startDate, "MMM d, yyyy")} to{" "}
                                {format(sprint.endDate, "MMM d, yyyy")})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {canStart && (
                    <Button
                        onClick={() => handleStatusChange("ACTIVE")}
                        disabled={loading}
                        className="bg-green-900 text-white"
                    >
                        开始冲刺
                    </Button>
                )}
                {canEnd && (
                    <Button
                        onClick={() => handleStatusChange("COMPLETED")}
                        disabled={loading}
                        variant="destructive"
                    >
                        结束冲刺
                    </Button>
                )}
            </div>
            {/* 切换状态过程中显示加载进度条 */}
            {loading && <BarLoader width={"100%"} className="mt-2" color="#36d7b7" />}
            {getStatusText() && (
                <Badge variant="" className="mt-3 ml-1 self-start">
                    {getStatusText()}
                </Badge>
            )}
        </>
    );
}
