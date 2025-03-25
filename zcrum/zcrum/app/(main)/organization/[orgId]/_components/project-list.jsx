import { getProjects } from '@/actions/projects';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import Link from 'next/link';
import DeleteProject from "./delete-project";
import { FaMousePointer } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
export default async function ProjectList({ orgId }) {
    const projects = await getProjects(orgId);

    // console.log(projects);

    if (projects.length === 0) {
        return (
            <div className='container flex mx-auto flex-col justify-center items-center mt-40'>
                <div className='text-3xl mb-20'>这里什么也没有...</div>
                <Button variant="outline">
                    <Link
                        href="/project/create"
                        className="text-blue-200 text-2xl flex items-center"
                    >
                        创建一个<FaMousePointer size={24} />
                    </Link>
                </Button>
                
            </div>
        )
    }

    return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => {
            return(
                <Card key={project.id} className="mb-4">
                    <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        {project.name}
                        <DeleteProject projectId={project.id}/>
                    </CardTitle>
                    
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500 mb-4">
                    <p>{project.description}</p>
                    <Link 
                    href={ `/project/${project.id} `}
                    className='text-blue-500 hover:underline'>
                        查看项目
                    </Link>
                    </CardContent>
                </Card>
            )
        })
        }
    </div>
)
    
}