"use client";
import { useState, useEffect } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import OrgSwitcher from '@/components/org-switcher';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '@/app/lib/validator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createProject } from '@/actions/projects';
import useFetch from '@/hooks/use-fetch';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';



const CreateProjectPage = () => {
    /* useOrganization返回isLoaded（指示 Clerk 是否已完成初始化）、organization（当前活跃的组织）、membership（当前组织成员资格对象，有role属性）。
        useUser()返回isLoaded、user（当前活动用户的对象）。
    */
    const router = useRouter();
    const { isLoaded: isOrgLoaded, membership } = useOrganization();
    const { isLoaded: isUserLoaded } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);

    /* 使用useform和zod进行表单验证 */    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(projectSchema),
    });

    
    /* 验证用户角色：只有admin才能创建项目 */
    useEffect(() => {
        if (isOrgLoaded && isUserLoaded && membership) {
            setIsAdmin(membership.role === 'org:admin');
        }
    }, [isOrgLoaded, isUserLoaded, membership]);


    /* 创建项目 */
    const {
        data:project, 
        loading, 
        error, 
        fn:createProjectFn
    } = useFetch(createProject);  //此时返回的project还是undefined，因为createProjectFn还没有被调用

    const onSubmit = async (data) => {
        if(!isAdmin) {
            alert('您没有权限创建项目！');
            return;
        }
        await createProjectFn(data);  // 调用异步函数
    };


    useEffect(() => {
        if (project) {
            toast.success('创建项目成功！');
            router.push(`/project/${project.id}`);
        }
    }, [loading]);  


    
    if (!isOrgLoaded || !isUserLoaded) {
        return null;
    }

    if (!isAdmin) {
        return (
            <div className='flex flex-co1gap-2 items-center justify-between'>
                <span className='text-2xl gradient-title'>您无权创建项目!</span>
                <OrgSwitcher />
            </div>
        )
    }

    

    return (
    <div className='container mx-auto py-10'>
        <h1 className='text-6xl text-center font-bold mb-8 gradient-title'>
            创建新项目
        </h1>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <Input
                id='name'
                className='bg-slate-950 ' 
                placeholder='项目名称'
                style={{ letterSpacing : '0.05em' }}
                {...register('name')}
                />
                <p className='text-red-500 text-sm mt-1'>{errors.name?.message}</p> 
            </div>

            <div>
                <Input
                id='key'
                className='bg-slate-950 ' 
                placeholder='项目标识码'
                style={{ letterSpacing : '0.05em' }}
                {...register('key')}
                />
                <p className='text-red-500 text-sm mt-1'>{errors.key?.message}</p> 
            </div>

            <div>
                <Textarea
                id='description'
                className='bg-slate-950 h-20' 
                placeholder='项目描述'
                style={{ letterSpacing : '0.05em' }}
                {...register('description')}
                />
                <p className='text-red-500 text-sm mt-1'>{errors.description?.message}</p> 
            </div>

            <Button disabled={loading} type="submit" size="lg" className="bg-blue-500 text-white">
                {loading ? '创建中...' : '创建项目'}
            </Button>
            {error && <p className='text-red-500 mt-2'>{error.message}</p>}
        </form>
    </div>
    )
}

export default CreateProjectPage;

