"use client";

import { OrganizationList, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Onboarding() {
  // const { organization } = useOrganization();  // 获取当前用户的组织信息
  const router = useRouter();

  // useEffect(() => {
  //   if (organization) {
  //       // 如果用户已经加入了组织，跳转到该组织的页面
  //       // slug 是组织的一个唯一标识符，通常用于生成 URL
  //     router.push(`/organization/${organization.slug}`);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [organization]);


  return (
    <div className="flex justify-center items-center pt-14">
      <OrganizationList
        hidePersonal  //隐藏个人组织
        afterCreateOrganizationUrl="/organization/:slug"  //在创建组织后将用户导航至组织的 slug。
        afterSelectOrganizationUrl="/organization/:slug"  //在用户选择组织后将其导航至该组织的 slug。
      />
    </div>
  );
}
