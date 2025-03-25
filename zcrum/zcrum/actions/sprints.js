"use server";
import React from 'react';
import { auth } from "@clerk/nextjs/server";
import { prisma as db } from "@/lib/prisma";

export async function createSprint (projectId, data) {
    console.log('Creating sprint for projectId:', projectId);  // 添加调试日志
    const {userId, orgId} = auth();
    if (!userId || !orgId) {
        throw new Error("用户未登录!");
    }

    const project = await db.project.findUnique({
        where: { id: projectId },
        include: { sprints: { orderBy: { createdAt: "desc" } } },
    });

    if (!project || project.organizationId !== orgId) {
        throw new Error("项目不存在!");
    }

    const sprint = await db.sprint.create({
        data: {
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            status: "PLANNED",
            projectId: projectId,
        }
    });

    return sprint;

}

export async function updateSprintStatus (sprintId, newStatus) {
    const {userId, orgId, orgRole} = auth();

    if (!userId || !orgId) {
        throw new Error("未经授权!");
    };

    try {
        // include 是一个用于指定查询返回结果中包含相关模型（表）数据的选项
        const sprint = await db.sprint.findUnique({
            where: { id: sprintId },
            include: { project: true },
        });

        if (!sprint ) {
            throw new Error("冲刺不存在!");
        }

        if (sprint.project.organizationId !== orgId) {
            throw new Error("未经授权!");
        }

        if (orgRole !== "org:admin") {
            throw new Error("只有管理员可以管理冲刺状态!");
        }

        const now = new Date();
        const startDate = new Date(sprint.startDate);
        const endDate = new Date(sprint.endDate);


        // 当前时间不在冲刺日期范围内，不能开启
        if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
            throw new Error("不能开启不在日期范围内的冲刺!");
        }

        // 当前冲刺并不在活跃状态，不能完成
        if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
            throw new Error("只能完成一个活跃的冲刺!");
        }

        const updateSprint = await db.sprint.update({
            where: { id: sprintId },
            data: { status: newStatus },
        });

        return{success: true, sprint: updateSprint};


    } catch (error) {
        throw new Error(error.message);
    }
}