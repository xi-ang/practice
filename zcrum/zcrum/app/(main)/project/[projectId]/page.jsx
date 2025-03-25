// // "use client";
// import React from 'react';
// import { getProject } from '@/actions/projects';
// import SprintCreateForm from '../_components/create-sprint';
// import SprintBoard from '../_components/sprint-board';
// import { FaMousePointer, FaHandPointer } from 'react-icons/fa';
// import { useState, useEffect } from 'react';
// import NotFound from '@/app/not-found';

// const ProjectPage = async ({ params }) => {
//   const { projectId } = params;
//   const project = await getProject(projectId);

//   if (!project) {
//     return <NotFound />;
//   }

//   return (
//     <div className="container mx-auto">
//       {/* sprint创建 */}
//       <SprintCreateForm
//         projectTitle={project.name}
//         projectId={projectId}
//         projectKey={project.key}
//         sprintKey={project.sprints?.length + 1}
//       />
//       {/* sprint版面(有sprint时显示) */}
//       {project.sprints.length > 0 ? (
//         <SprintBoard
//           sprints={project.sprints}
//           projectId={projectId}
//           orgId={project.organizationId}
//         />
//       ) : (
//         <div className='flex flex-col'>
//           <div className='flex justify-end items-center w-full gap-2 '>
//             <p>点击右上方的按钮创建冲刺</p>
//           </div>
//         </div>
//         // <div className='flex flex-col'>
//         //   <div className='flex justify-end items-center w-full gap-2 '>
//         //     <p>点击右上方的按钮创建冲刺</p>
//         //     <FaHandPointer size={24} />
//         //   </div>
//         //   <div className='flex flex-col items-center justify-center mt-20'>
//         //     <p className='text-2xl'>这里什么也没有...</p>
//         //   </div>
//         // </div>
//       )
//     }
//     </div>
//   )
// };


"use client"; // 确保这是客户端组件
import React, { useState } from 'react';
import { getProject } from '@/actions/projects';
import SprintCreateForm from '../_components/create-sprint';
import SprintBoard from '../_components/sprint-board';
import NotFound from '@/app/not-found';
import { FaHandPointer } from 'react-icons/fa';

const ProjectPage = ({ params }) => {
  const { projectId } = params;
  const [showForm, setShowForm] = useState(false); // 新增状态
  const [project, setProject] = useState(null); // 状态管理项目数据

  // 异步获取项目数据
  const loadProject = async () => {
    const data = await getProject(projectId);
    setProject(data);
  };

  // 初始化加载
  React.useEffect(() => {
    loadProject();
  }, []);

  if (!project) return <NotFound />;

  return (
    <div className="container mx-auto">
      {/* 传递状态控制方法给子组件 */}
      <SprintCreateForm
        projectTitle={project.name}
        projectId={projectId}
        projectKey={project.key}
        sprintKey={project.sprints?.length + 1}
        showForm={showForm}
        onFormToggle={setShowForm}
        onSuccess={loadProject} // 新增成功回调
      />

      {/* 条件渲染逻辑 */}
      {project.sprints.length > 0 ? (
        <SprintBoard
          sprints={project.sprints}
          projectId={projectId}
          orgId={project.organizationId}
        />
      ) : (
        // 只在未显示表单时展示提示
        !showForm && (
          // <div className='flex flex-col'>
          //   <div className='flex justify-end items-center w-full gap-2'>
          //     <p>点击右上方的按钮创建冲刺</p>
          //   </div>
          // </div>
          <div className='flex flex-col'>
            <div className='flex justify-end items-center w-full gap-2 '>
              <p>点击右上方的按钮创建冲刺</p>
              <FaHandPointer size={24} />
            </div>
            <div className='flex flex-col items-center justify-center mt-20'>
              <p className='text-2xl'>这里什么也没有...</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};


export default ProjectPage;
