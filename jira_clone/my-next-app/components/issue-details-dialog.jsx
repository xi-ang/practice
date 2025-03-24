"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import UserAvatar from "./user-avater";
import useFetch from "@/hooks/use-fetch";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BarLoader } from "react-spinners";
import { ExternalLink } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import statuses from "@/data/status";
import { deleteIssue, updateIssue } from "@/actions/issues";

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function IssueDetailsDialog({
    isOpen,
    onClose,
    issue,
    onDelete = () => { },
    onUpdate = () => { },
    borderCol = "",
}) {
    const [status, setStatus] = useState(issue.status);
    const [priority, setPriority] = useState(issue.priority);
    const { user } = useUser();
    const { membership } = useOrganization();
    const router = useRouter();
    const pathname = usePathname();

    const {
        loading: deleteLoading,
        error: deleteError,
        fn: deleteIssueFn,
        data: deleted,
    } = useFetch(deleteIssue);

    const {
        loading: updateLoading,
        error: updateError,
        fn: updateIssueFn,
        data: updated,
    } = useFetch(updateIssue);


    const handleDelete = async () => {
        if (window.confirm("您确定要删除吗?")) {
            deleteIssueFn(issue.id);
        }
    };

    // 改变issue状态
    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus);
        updateIssueFn(issue.id, { status: newStatus, priority });
    };

    // 改变issue优先级
    const handlePriorityChange = async (newPriority) => {
        setPriority(newPriority);
        updateIssueFn(issue.id, { status, priority: newPriority });
    };

    useEffect(() => {
        if (deleted) {
        //有删除，那么关闭对话框，并且执行父组件传递过来的删除函数
            onClose();
            onDelete();
        }
        // 如果有更新，那么执行父组件传递过来的更新函数
        if (updated) {
            onUpdate(updated);
        }
    }, [deleted, updated, deleteLoading, updateLoading]);

    // 只有该issue的reporter或者组织管理员可以修改issue
    const canChange =
        user.id === issue.reporter.clerkUserId || membership.role === "org:admin";

    const handleGoToProject = () => {
        router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`);
    };

    const isProjectPage = !pathname.startsWith("/project/");
 
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-3xl">{issue.title}</DialogTitle>
                        {/* 假设用户当前在一个问题（issue）的详情对话框里，这个对话框可能在项目的不同地方被打开，
                        比如在项目页面内部或者其他页面。如果用户不在项目页面（即路径不是以`/project/`开头），
                        那么显示这个按钮，让用户可以快速跳转到相关的项目页面，并携带当前的冲刺ID作为查询参数。 
                        例如，用户可能在组织页面查看问题，点击这个按钮可以快速跳转到具体的项目页面，同时保持上下文（如当前的冲刺）。*/}
                        {isProjectPage && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleGoToProject}
                                title="去到项目页面"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {/* 在响应删除或更新请求过程中显示进度条 */}
                {(updateLoading || deleteLoading) && (
                    <BarLoader width={"100%"} color="#36d7b7" />
                )}


                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        {/* 状态下拉框 */}
                        <Select value={status} onValueChange={handleStatusChange} disabled={!canChange}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="状态" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((option) => (
                                    <SelectItem key={option.key} value={option.key}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* 优先级下拉框 */}
                        <Select
                            value={priority}
                            onValueChange={handlePriorityChange}
                            disabled={!canChange}
                        >
                            <SelectTrigger className={`border ${borderCol} rounded`}>
                                <SelectValue placeholder="优先级" />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 描述 */}
                    <div>
                        <h4 className="font-semibold">描述</h4>
                        <MDEditor.Markdown
                            className="rounded px-2 py-1"
                            source={issue.description ? issue.description : "--"}
                        />
                    </div>
                    {/* 用户头像 */}
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <h4 className="font-semibold">被分配者</h4>
                            <UserAvatar user={issue.assignee} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4 className="font-semibold">报告者</h4>
                            <UserAvatar user={issue.reporter} />
                        </div>
                    </div>

                    {/* 删除issue */}
                    {canChange && (
                        <Button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            variant="destructive"
                        >
                            {deleteLoading ? "删除中..." : "删除问题"}
                        </Button>
                    )}
                    {/* 显示删除或更新issue时的错误 */}
                    {(deleteError || updateError) && (
                        <p className="text-red-500">
                            {deleteError?.message || updateError?.message}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
