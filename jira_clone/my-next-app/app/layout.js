import "./globals.css";
import "tailwindcss";
import { ThemeProvider } from "@/components/theme-provider";
//Noto_Sans是支持中文的字体，可以替换成其他支持中文的字体
import { Noto_Sans_SC } from "next/font/google"; 
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { zhCN } from '@clerk/localizations'
import { shadesOfPurple } from "@clerk/themes"
import { Toaster } from "@/components/ui/sonner"

const notoSans = Noto_Sans_SC ({
  subsets: ["latin"], // 加载拉丁字母和中文字符集
});

export const metadata = {
  title: "Zcrum",  //这里设置页面的title
  description: "Project Management App",
};

export default function RootLayout({ children }) {
  // const clerkFrontendApi = 'your-clerk-frontend-api'; // Clerk 控制面板提供的 API

  return (
    // localization设置clerk组件在本地中文呈现,appearance内设置用户界面主题
    <ClerkProvider 
    // frontendApi={clerkFrontendApi} 
    localization={zhCN}
    appearance={{
      baseTheme: shadesOfPurple,
      // 自定义clerk组件的样式
      variables: {
        colorPrimary:"#3b82f6",
        colorBackground:"#1a202c",
        colorInputBackground:"#2D3748",
        colorInputText:"#F3F4F6", 
      },
      elements: {
        // Clerk组件内联样式的高优先级覆盖tailwind css类优先级，因此需要强调!
        formButtonPrimary: "!text-white",
        card: "!bg-gray-800",
        headerTitle:"!text-blue-400",
        headerSubtitle:"!text-gray-400",
      },
      } 
    }
    dynamic
    >
      <html lang="zh-CN">
        {/* 在body中设置字体（添加相应的类名 */}
        <body className={`${notoSans.className} dotted-background`}> 
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem
              disableTransitionOnChange>

            <Header />

            {/* min-h-screen是设置main区最小高度与屏幕等高 */}
            <main className="min-h-screen">{children}</main>

            <Toaster richColors/>

            <footer className="bg-gray-900 py-12">
              <div className="container mx-auto text-center text-gray-200">
                <p>Made With ❤ by Xiang</p>
              </div>  
            </footer>
            
            
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
