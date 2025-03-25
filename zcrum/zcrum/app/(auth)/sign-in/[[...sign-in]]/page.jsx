import React from "react";
import { SignIn } from "@clerk/nextjs";
// auth加()是为了防止next.js将其作为一个路由



const SignInPage = () => {
    // SignIn预构建的登录表单
    return <SignIn />
};

export default SignInPage;