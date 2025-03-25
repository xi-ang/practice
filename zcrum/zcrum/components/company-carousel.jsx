"use client"
import Image from "next/image";
import React from "react";
import Autoplay from "embla-carousel-autoplay"
import companies from "@/data/companies";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
// 定义一个名为CompanyCarousel的函数组件
const CompanyCarousel = () => {
    // 返回一个Carousel组件，其中包含Autoplay插件，延迟时间为2000毫秒
    return (
        <Carousel
            plugins={[
                Autoplay({
                delay: 2000,
                }),
            ]}
            className="w-full py-10"
        >
      
            <CarouselContent className="flex gap-5 sm:gap-20 items-center">
                {companies.map(({name, path, id}) => {
                    return (
                        <CarouselItem key={id} className="basis-1/3 lg:basis-1/6">
                            <Image 
                                src={path} 
                                alt={name}
                                width={200}
                                height={56}
                                className="h-9 sm:h-14 w-auto object-contain"
                                />
                        </CarouselItem>
                    )

                })}
            </CarouselContent>
    </Carousel>
    )
}

export default CompanyCarousel;