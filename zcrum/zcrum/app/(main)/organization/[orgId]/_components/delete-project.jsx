"use client";
import { useOrganization } from '@clerk/nextjs';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteProject } from '@/actions/projects';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { useEffect } from 'react';

const DeleteProject = ({projectId}) => {
  const { membership } = useOrganization();

  const router = useRouter();

  const {
    data:deleted, 
    loading: isDeleting, 
    error, 
    fn:deleteProjectFn,
} = useFetch(deleteProject);

  const handleDelete = async () => {
    if (window.confirm("确定删除这个项目吗？")){
      await deleteProjectFn(projectId);
    }
    
  }

  useEffect(() => {
    if (deleted) {
      toast.error("项目已删除!");
      router.refresh();
    }
    }, [deleted]);  


  const isAdmin = membership?.role === 'org:admin';
  if (!isAdmin) {
    return null; 
  }

  return (
    <div>
      <Button 
      variant="ghost"
      size="sm"
      className={`${isDeleting?"animate-pulse":""}`}
      onClick={handleDelete}
      disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4"/>
      </Button>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  )
}

export default DeleteProject; 
