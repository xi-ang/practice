import { PrismaClient } from '@prisma/client'

// 数据库客户端单例模式
export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

// 在开发模式development下，Node.js 服务器通常会在代码变动时进行热重载，导致数据库连接和 Prisma 实例被重新创建。
// 如果每次都创建新的 Prisma 实例，会浪费资源并导致性能下降。
// 因此，在开发模式下我们将实例保存到 globalThis 上，这样在热重载时可以避免重新创建实例。

//在 生产环境production 中，Prisma 实例通常是按需创建的，不会缓存到 globalThis 上，因为生产环境下不会有热重载的情况.