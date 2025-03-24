
import { SignedOut, SignedIn, SignInButton, } from "@clerk/nextjs";
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button";
import { PenBox } from "lucide-react";
import UserMenu from "./user-menu";
import { checkUser } from "../lib/checkUser";
import UserLoading from "./user-loading";

const Header = async () => {
    await checkUser();

    return (
        <div>
            <header className="container mx-auto">
                <nav className="py-6 px-4 flex justify-between items-center">
                    <Link href='/'>
                        <Image 
                        // 在 Next.js 中，public 文件夹下的资源可以通过根路径直接访问。
                        src={'/logo2.png'}
                        alt="logo"
                        width={100}
                        height={56}
                        className="h-10 w-auto object-contain"
                        />
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <Link href='/project/create'>
                         <Button variant="destructive" className="flex items-center gap-2">
                            <PenBox size={18}/>
                            <span>创建项目</span>
                         </Button> 
                        </Link>

                        {/* SignedOut包裹在用户 未登录（即用户没有认证）时要显示的内容。 */}
                        <SignedOut>
                            {/* <SignInButton /> 显示一个登录按钮。用户点击该按钮后，Clerk 会自动引导用户到sign-in 页面。 */}
                            <SignInButton forceRedirectUrl="/onboarding">  
                                <Button variant="outline">登录</Button>
                            </SignInButton>
                        </SignedOut>

                        {/* SignedIn包裹在用户 已登录（即用户已经认证）时要显示的内容。 */}
                        <SignedIn>
                            <UserMenu />
                        </SignedIn>
                    </div>
                    
                </nav>

                <UserLoading />
            </header>
        </div>
        
    )
}

export default Header;