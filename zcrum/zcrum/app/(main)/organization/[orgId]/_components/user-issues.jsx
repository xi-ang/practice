import { Suspense } from "react";
import { getUserIssues } from "@/actions/issues";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueCard from "@/components/issue-card";

export default async function UserIssues({ userId }) {
  const issues = await getUserIssues(userId);

  if (issues.length === 0) {
    return null;
  }

  const assignedIssues = issues.filter(
    (issue) => issue.assignee.clerkUserId === userId
  );
  const reportedIssues = issues.filter(
    (issue) => issue.reporter.clerkUserId === userId
  );

  return (
    <>
      <h1 className="text-4xl font-bold gradient-title mb-4">我的问题</h1>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned">被分配的</TabsTrigger>
          <TabsTrigger value="reported">我报道的</TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
            {/* 当子组件需要等待异步操作（如数据加载、组件代码加载）时，显示 fallback 中的内容 */}
          <Suspense fallback={<div>加载中...</div>}>
            <IssueGrid issues={assignedIssues} />
          </Suspense>
        </TabsContent>
        <TabsContent value="reported">
          <Suspense fallback={<div>加载中...</div>}>
            <IssueGrid issues={reportedIssues} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
}


function IssueGrid({ issues }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} showStatus />
      ))}
    </div>
  );
}
