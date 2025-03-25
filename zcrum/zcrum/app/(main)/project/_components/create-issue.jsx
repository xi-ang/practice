"use client";

import { useEffect } from "react";
import { BarLoader } from "react-spinners";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import useFetch from "@/hooks/use-fetch";
import { createIssue } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organization";
import { issueSchema } from "@/app/lib/validator";
import { toast } from "sonner";

export default function IssueCreationDrawer({
    isOpen,  //控制抽屉的显示与隐藏
    onClose,
    sprintId,
    status,
    projectId,
    onIssueCreated,
    orgId,
}) {
    // console.log("isOpen", isOpen);
    // console.log("orgId", orgId);

    // 创建新issue请求管理
    const {
        loading: createIssueLoading,
        fn: createIssueFn,
        error,
        data: newIssue,
    } = useFetch(createIssue);

    // 获取组织用户请求管理
    const {
        loading: usersLoading,
        fn: fetchUsers,
        data: users,
    } = useFetch(getOrganizationUsers);

    //建立创建新issue的表单
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            priority: "MEDIUM",
            description: "",
            assigneeId: "",
        },
    });

    //当抽屉打开时，获取组织用户
    useEffect(() => {
        if (isOpen && orgId) {
            console.log("fetching users");
            fetchUsers(orgId);
        }
    }, [isOpen, orgId]);

    //表单提交触发createIssueFn
    const onSubmit = async (data) => {
        await createIssueFn(projectId, {
            ...data,
            status,
            sprintId,
        });
    };

    // 当创建新issue成功时，重置表单并关闭抽屉，调用传递进来的onIssueCreated（获取所有issues）
    useEffect(() => {
        if (newIssue) {
            reset();
            onClose();
            onIssueCreated();
            toast.success("成功创建问题!");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newIssue, createIssueLoading]);

    return (
        <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Create New Issue</DrawerTitle>
                </DrawerHeader>
                {usersLoading && <BarLoader width={"100%"} color="#36d7b7" />}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">
                            标题
                        </label>
                        <Input id="title" {...register("title")} />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="assigneeId"
                            className="block text-sm font-medium mb-1"
                        >
                            被分配者
                        </label>
                        <Controller
                            name="assigneeId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择分配给谁" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users?.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.assigneeId && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.assigneeId.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium mb-1"
                        >
                            描述
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <MDEditor value={field.value} onChange={field.onChange} />
                            )}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="priority"
                            className="block text-sm font-medium mb-1"
                        >
                            优先级
                        </label>
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择优先级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">低</SelectItem>
                                        <SelectItem value="MEDIUM">中</SelectItem>
                                        <SelectItem value="HIGH">高</SelectItem>
                                        <SelectItem value="URGENT">紧急</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* 这里的error不是表单的errors，而是useFetch(createIssue)返回的error */}
                    {error && <p className="text-red-500 mt-2">{error.message}</p>}
                    <Button
                        type="submit"
                        disabled={createIssueLoading}
                        className="w-full"
                    >
                        {createIssueLoading ? "创建中..." : "创建问题"}
                    </Button>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
