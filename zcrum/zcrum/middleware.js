import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
/* 
  创建路由匹配器：参数是一个数组，里面的每个字符串都是正则表达式，用来匹配请求的路径.
  用来保护路由，会返回req对象，当用户想要访问其中的路径时，req为true。
*/
const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/organization(.*)",
  "/project(.*)",
  "/issue(.*)",
])

/*
  `clerkMiddleware()`配置：在页面渲染前执行，中间件拦截请求 → 执行认证逻辑 → 决定是否放行或重定向。
  仅对服务端请求生效，不会影响客户端路由跳转（如 <Link> 导航）。
*/
export default clerkMiddleware((auth, req) => {
  // 如果用户未登录，并且当前访问的页面是受保护的，则重定向到登录页面。
  if (!auth().userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn(); 
  }

  // 如果用户 已登录，没有加入任何组织，并且当前访问的页面不是 /onboarding 或根路径 /，则会自动将用户重定向到 /onboarding 页面。
  if(
    auth().userId &&
    !auth().orgId &&
    // req.nextUrl：是 Next.js 封装的 URL 对象，用于操作和访问当前请求的 URL
    req.nextUrl.pathname !=="/onboarding"&&
    req.nextUrl.pathname !=="/"
  ) {
    // NextResponse.redirect：Next.js 提供的重定向方法，生成一个 302 响应
    return NextResponse.redirect(new URL("/onboarding", req.url));
  
  }
    
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};