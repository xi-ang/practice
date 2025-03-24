
import { z } from "zod";
export const projectSchema = z.object({
    name: z
        .string()
        .min(1, "必须填写项目名称!")
        .max(100, "项目名称不能超过100个字符!"),
    key: z
        .string()
        .min(2, "项目关键字必须至少为 2 个字符!")
        .max(10, "项目关键字不能超过10个字符!"),
    description: z
        .string()
        .max(500, "项目描述不能超过500个字符!")
        .optional(),
})

export const sprintSchema = z.object({
    name: z.string().min(1, "必须填写冲刺名称!"),
    startDate: z.date(),
    endDate: z.date(),
});

export const issueSchema = z.object({
    title: z.string().min(1, "Title is required"),
    // .cuid() 是一个字符串验证方法, CUID是一种生成唯一标识符的算法
    // 常用于数据库 ID 字段的校验，确保传入的 ID 符合预期格式
    assigneeId: z.string().cuid("Please select assignee"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  });