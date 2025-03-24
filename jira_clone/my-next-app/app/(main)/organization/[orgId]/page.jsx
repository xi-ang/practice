import React from 'react';
import { getOrganization } from '@/actions/organization';
import OrgSwitcher from '@/components/org-switcher';
import ProjectList from "./_components/project-list";
import UserIssues from './_components/user-issues';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';


const Organization = async ({params}) => {
    const { orgId } = params;  // 获取 URL 中的 orgId（其实是slug）
    
    const oraganization = await getOrganization(orgId);

    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    if (!oraganization) {
        return <div>未找到组织</div>;
    }

    return (
        <div className='container mx-auto px-4'>
            <div className='mb-4 flex flex-col sm:flex-row justify-between items-start'>
                <h1 className='text-5xl font-bold gradient-title pb-2'>{oraganization.name}的项目</h1>
                <OrgSwitcher />
            </div>
        
            <div className='mb-4'>
                {/* 在此显示项目 */}
                <ProjectList orgId={orgId} />
            </div>
            {/* 在此显示用户分配和报告的问题 */}
            <div className='mt-8'>
                <UserIssues userId={userId}/>
            </div>

            
        </div>
    )
;}

export default Organization;