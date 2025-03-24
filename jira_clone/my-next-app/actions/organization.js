"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma as db } from "@/lib/prisma";

export async function getOrganization(slug) {
    const { userId } = auth();  // 获取当前用户的 ID
    
    if (!userId) {
        throw new Error("用户未通过身份验证！");  // 如果用户未认证，则抛出错误
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },  // 根据用户的 Clerk User ID 查询数据库中的用户
    });

    if (!user) {
        throw new Error("用户未发现！");  // 如果未找到用户，抛出错误
    }

    const organization = await clerkClient().organizations.getOrganization({
        slug  // 使用组织的 slug 查找组织
    });

    if (!organization) {
        return null;  // 如果找不到该组织，返回 null
    }

    const { data: membership } = await clerkClient().organizations.getOrganizationMembershipList({
        organizationId: organization.id,  // 获取组织的成员列表
    });

    // 查找当前用户是否是该组织的成员
    const userMembership = membership.find(
        (member) => member.publicUserData.userId === userId
    );

    if (!userMembership) {
        return null;  // 如果当前用户不是该组织的成员，返回 null
    }

    return organization;  // 如果用户是该组织的成员，返回组织信息
}

export async function getOrganizationUsers(orgId) {
    const { userId } = auth();  
    if (!userId) {
        throw new Error("未经授权！");  
    };

    const user = await db.user.findUnique({
        where: { clerkUserId: userId }, 
    });

    if (!user) {
        throw new Error("未找到用户!");  
    }

    const organizationMemberships = 
        await clerkClient().organizations.getOrganizationMembershipList({
        organizationId: orgId,  // 获取组织的成员列表
    });
    
    const userIds = organizationMemberships.data.map((membership) => membership.publicUserData.userId);

    const users = await db.user.findMany({
        // in 是 Prisma 提供的一种条件运算符，它用来检查某个字段的值是否在指定的列表或集合中。in 允许你传入一个数组，并将该字段的值与数组中的值进行比较。
        where: { clerkUserId: { in: userIds } },  // 根据成员的用户 ID 查询数据库中的用户
    });

    console.log(users);
    return users;


}
