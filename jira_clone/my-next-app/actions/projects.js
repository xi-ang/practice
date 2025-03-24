"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma as db } from "@/lib/prisma";
import { getOrganization } from "./organization";

// ——————————————创建项目——————————————
export async function createProject( data ) {
    /* 
    auth()返回当前活跃用户的对象，仅适用于 App Router，仅适用于服务器端，需要clerkMiddleware()配置。
    可以有userId：当前用户的唯一标识符。
    orgId：当前用户所属的组织 ID。
    sessionId：当前用户的会话 ID。
    user：当前用户的详细信息（如姓名、电子邮件）。
    isSignedIn：一个布尔值，表示用户是否已登录。
    email、firstName、lastName：用户的个人信息。
    */
    const { userId, orgId } = auth();
    
    if (!userId) { throw new Error("未经授权！"); }
    if (!orgId) { throw new Error("未发现组织！"); } 

    // 获取组织的成员列表
    /* 后端所有资源操作都作为子 API 安装在clerkClient对象上。 
        包含user、organization等子api：
        1.有getUser(userId)、getUsers()、createUser()、updateUser(userId, updates)、deleteUser(userId)等方法。
        2.有getOrganization(organizationId)、getOrganizationMembershipList(organizationId)、addOrganizationMember(organizationId, userId)、removeOrganizationMember(organizationId, userId)等方法。
    */
    const { data: membership } = await clerkClient().organizations.getOrganizationMembershipList({
            organizationId: orgId,  
        });
    
    // 检查管理员权限
    /* publicUserData包含firstName、lastName、imageUrl、userId? */
    const userMembership = membership.find(
        (member) => member.publicUserData.userId === userId
    );
    if (!userMembership || userMembership.role !== "org:admin") {
        throw new Error("只有组织管理员才能创建项目!");
    }

    try {
        // 检查 key 是否已存在
        const existingProject = await db.project.findUnique({
            where: { key: data.key },
        });
        if (existingProject) {
            throw new Error("项目标识码已存在，请更换!");
        }

        // 创建项目
        const project = await db.project.create({
            data: {
                name: data.name,
                key: data.key,
                description: data.description,
                organizationId: orgId,
            },
        }) 
        return project;
    } catch (error) {
        throw new Error("创建项目失败:" + error.message);
    }
}


// ——————————————获取项目列表——————————————
export async function getProjects(slug) {
    const organization = await getOrganization(slug);  // 通过 slug 获取组织
    const orgId = organization.id;  // 获取到组织的 id

    const { userId } = auth();
    if (!userId) { throw new Error("未经授权!"); }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) { throw new Error("未发现用户！");}

    const projects = await db.project.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
       
    });

    // console.log(projects);

    return projects;
    
}



// ——————————————删除项目——————————————
export async function deleteProject(projectId) {
    const { userId, orgId, orgRole } = auth();

   
    if (!userId || !orgId) { 
        throw new Error("未经授权！"); 
    }

    if (orgRole !== "org:admin") {
        throw new Error("您没有权限删除项目！");
    }

    console.log("projectId: ", projectId);

    const project = await db.project.findUnique({
        where: { id: projectId },
    });

    if (!project || project.organizationId !== orgId) { throw new Error("未找到项目或您无权删除！"); }

    await db.project.delete({
        where: { id: projectId },
    });

    return true;
}


// ——————————————获取项目——————————————
export async function getProject(projectId) {
    const { userId, orgId, orgRole } = auth();

    if (!userId || !orgId) { 
        throw new Error("未经授权！"); 
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) { throw new Error("未找到用户！"); }

    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            sprints: {
                orderBy: {
                    createdAt: "desc"
                },
            },
        }
    });

    if(!project) {
        throw new Error("未找到项目！");
    }

    if(project.organizationId !== orgId) {
        throw new Error("您没有权限查看该项目！");
    }

    return project;
}   