"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { ChartNoAxesGantt } from "lucide-react";


const UserMenu = () => {
    return (
        // “管理帐户”选项manageAccount会启动该<UserProfile />组件，提供对个人资料和安全设置的访问。
        <UserButton appearance={{
            elements: {
                avatarBox: 'w-10 h-10',
            },
        }}>
            {/* <UserButton.Link>- 允许您向组件添加链接<UserButton />，如自定义页面或外部 URL。
            单击后可导航至某个页面的菜单项。3个属性都是必需的。 */}
            <UserButton.MenuItems>
                <UserButton.Link 
                    label="我的组织"
                    labelIcon={<ChartNoAxesGantt size={15}/>}
                    href="/onboarding"
                    />

                {/* <UserButton.Action>包含的是默默人的菜单项 */}
                <UserButton.Action label="manageAccount" />
                    
            </UserButton.MenuItems>
        </UserButton>
    )
}

export default UserMenu;