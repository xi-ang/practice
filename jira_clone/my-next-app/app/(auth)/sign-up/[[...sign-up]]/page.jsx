import React from "react";
// auth加()是为了防止next.js将其作为一个路由
import { SignUp } from "@clerk/nextjs";


const SignUpPage = () => {
    // SignIn预构建的登录表单
        return <SignUp />
};

export default SignUpPage;