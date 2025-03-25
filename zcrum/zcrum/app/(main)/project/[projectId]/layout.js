import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners';

const ProjectLayout = async ({children}) => {
  return (
    <div className='mx-auto container'>
        <Suspense fallback={<span>项目加载中...</span>}>
            {children}
        </Suspense>
      
    </div>
  )
}

export default ProjectLayout;
