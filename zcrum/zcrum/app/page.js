import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Layout, Calendar, BarChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CompanyCarousel from "@/components/company-carousel";
import faqs from "@/data/faqs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "直观的看板",
    description:
      "使用我们简单易用的看板，可视化您的工作流程并优化团队生产力。",
    icon: Layout,
  },
  {
    title: "强大的冲刺规划",
    description:
      "有效规划和管理冲刺，确保团队始终专注于实现价值。",
    icon: Calendar,
  },
  {
    title: "综合报告",
    description:
      "通过详细、可定制的报告和分析，深入了解团队的表现。",
    icon: BarChart,
  },
];

// 导出一个默认的Home函数
export default function Home() {
  // 返回一个div元素，其中包含一个Button元素和一个this字符串
  return (
    
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto py-20 text-center">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pb-6 flex flex-col">
        简化工作流程<br />
        <span className="flex mx-auto gap-3 sm:gap-4 items-center mt-3">
          通过{" "}
          <Image 
            src={"/logo2.png"}
            alt="Zscrum"
            width={400}
            height={80}
            className="h-14 sm:h-24 w-auto object-contain"
          />
        </span>
        
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">利用我们直观的项目管理解决方案增强团队能力。</p>
        <Link href="/onboarding">
          <Button size="lg" className="mr-4">
            开始使用 <ChevronRight size={18}/>
          </Button>
        </Link>
        <Link href="#features">
          <Button size="lg" variant="outline" className="mr-4">了解更多</Button>
        </Link>
      </section>

      <section id="features" className="bg-gray-900 py-15 px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">关键功能</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
            return (
              <Card key={index} className="bg-gray-800">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mb-4 text-blue-300" />
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-300">{feature.description}</p>
              
                </CardContent>
              </Card>
            )
          })}</div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">深受行业领袖信赖</h3>
          <CompanyCarousel />
        </div>
      </section>

      <section className="bg-gray-900 py-15 px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">常见问题</h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => {
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              );
              
            })
            }
            
          </Accordion>
        </div>
      </section>

      <section className="py-20 text-center px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">准备好改变工作流程？</h3>
          <p className="text-lg mb-12 text-center"> 
            加入数以千计的团队，使用 ZCRUM 来简化他们的
            项目并提高生产力。
          </p>

          <Link href="/onboarding">
            <Button className="animate-bounce">
              开始使用 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
     
    </div>
  );
}
