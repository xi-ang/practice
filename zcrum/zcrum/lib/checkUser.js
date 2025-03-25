
import { currentUser } from "@clerk/nextjs/server"
import { prisma as db } from "./prisma";


export const checkUser = async () => {
    // 获取当前已登录用户的信息
    const user = await currentUser(); 

    if (!user) {
        return null;
    }

    try {
        // 打印当前用户信息，确保能获取到用户数据
        // console.log('Current user:', user);
        // 查询数据库中是否存在该用户
        const loggedInUser = await db?.user.findUnique({
            where: {
                clerkUserId: user.id,
            },
        });
        if (loggedInUser) {
            return loggedInUser;
        }

        // 检查 emailAddresses 是否存在并且有效
        // console.log('User emailAddresses:', user.emailAddresses);


        const name = `${user.firstName} ${user.lastName}` ;
        // console.log('Creating new user with name:', name);

        const newUser = await db?.user.create({
            data:{
                clerkUserId: user.id,
                name,
                imageUrl: user.imageUrl,
                email:user.emailAddresses[0].emailAddress,
            }
        })
        console.log('New user created:', newUser); // 打印创建的用户数据
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error); // 捕获并打印错误
    }
};