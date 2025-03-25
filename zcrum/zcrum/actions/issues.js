"use server";
import { prisma as db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server'
import React from 'react'

export async function createIssue(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('未经授权！');
  };

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const lastIssue = await db.issue.findFirst({
    where: { projectId: projectId, status: data.status },
    orderBy: { id: 'desc' }
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: projectId,
      sprintId: data.sprintId,
      reporterId: user.id,
      assigneeId: data.assigneeId || null, // Add this line
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}


export async function getIssuesForSprint(sprintId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("未经授权！");
  }

  const issues = await db.issue.findMany({
    where: { sprintId: sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}


//处理因为issuecard的拖拽导致的issue顺序变化
export async function updateIssueOrder(updatedIssues) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("未经授权！");
  }

  // Start a transaction（要么完成要么失败，，每个操作必须完成）
  await db.$transaction(async (prisma) => {
    // Update each issue
    for (const issue of updatedIssues) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
      });
    }
  });

  return { success: true };
}


export async function deleteIssue(issueId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("未经授权！");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("用户未找到！");
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("问题未找到！");
  }

  if (
    issue.reporterId !== user.id &&
    !issue.project.adminIds.includes(user.id)  //???????????
  ) {
    throw new Error("您无权删除此问题！");
  }

  await db.issue.delete({ where: { id: issueId } });

  return { success: true };
}

// 这里只针对改变issue的status和order（点击issue card后的编辑issue功能）
export async function updateIssue(issueId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("未经授权！");
  }

  try {
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });

    if (!issue) {
      throw new Error("问题未找到！");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("未经授权！");
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return updatedIssue;
  } catch (error) {
    throw new Error("更新问题出错: " + error.message);
  }
}

// \获取用户相关的所有issues（报告的或是被分配的）
export async function getUserIssues(userId) {
  const { orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("没有用户或组织被发现！");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("用户未找到！");
    
  }


  const issues = await db.issue.findMany({
    where: { 
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: { organizationId: orgId },
    },
    include: {
      project: true,  
      assignee: true,
      reporter: true,
    },
    orderBy: {
      updatedAt: "desc",
    }
  })

  return issues;
  
}


