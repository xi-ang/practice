"use client";
import { useOrganization, OrganizationSwitcher, useUser, SignedIn, RedirectToCreateOrganization } from '@clerk/nextjs';
import React from 'react';
import { usePathname } from 'next/navigation';

const OrgSwitcher = () => {
    const { isLoaded } = useOrganization();
    const { isLoaded: isUserLoaded } = useUser();

    const pathname = usePathname();
    
    if (!isLoaded || !isUserLoaded) {
        return null;
    }

    return (
    <div>
        <SignedIn>
            <OrganizationSwitcher
            hidePersonal
            //当用户创建一个新组织之后，系统应该重定向到哪个 URL,其中 slug 是新创建组织的唯一标识符。。
            afterCreate0rganizationUrl="/organization/:slug"
            afterSelectOrganizationUrl="/organization/:slug"
            // 控制组织创建的模式
            createOrganizationMode={
              // Modal模式意味着点击创建组织按钮后，会在当前页面弹出一个模态框，用户无需离开当前页面即可完成创建。
              // 而Navigation模式则是跳转到一个新的页面，用户需要导航到指定的URL（也即是createOrganizationUrl指定的url）来创建组织。
                pathname === "/organization" ? "navigate" : "model"
            }
            createOrganizationUrl="/onboarding"
            appearance={{
                elements: {
                  organizationSwitcherTrigger:
                    "!border !border-gray-300 !rounded-md !px-5 !py-2",
                  organizationSwitcherTriggerIcon: "!text-white",
                },
              }}
            />
        </SignedIn>
    </div>

    
    )
};

export default OrgSwitcher;