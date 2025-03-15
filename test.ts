import { Context } from 'https://esm.d8d.fun/hono@4.7.4'

// 定义接口返回数据类型
interface ApiResponse<T = any> {
  success: boolean
  code?: string
  message?: string
  data?: T
}

// 定义一些示例数据
const mockUsers = [
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
  { id: 3, name: '王五', age: 35 }
]

// 创建一个路由处理器
export default async function handler(c: Context) {
  // 获取请求方法和路径
  const method = c.req.method
  const path = c.req.path.replace('/esm/test', '')

  // 根据不同的路径返回不同的响应
  switch (`${method} ${path}`) {
    case 'GET /users':
      return c.json<ApiResponse>({
        success: true,
        data: mockUsers
      })

    case 'GET /users/count':
      return c.json<ApiResponse>({
        success: true,
        data: {
          total: mockUsers.length
        }
      })

    case 'POST /users':
      try {
        const body = await c.req.json()
        const newUser = {
          id: mockUsers.length + 1,
          ...body
        }
        return c.json<ApiResponse>({
          success: true,
          data: newUser,
          message: '创建用户成功'
        }, 201)
      } catch (error) {
        return c.json<ApiResponse>({
          success: false,
          code: 'INVALID_REQUEST',
          message: '无效的请求数据'
        }, 400)
      }

    case 'GET /health':
      return c.json<ApiResponse>({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      })

    default:
      return c.json<ApiResponse>({
        success: false,
        code: 'NOT_FOUND',
        message: '接口未找到'
      }, 404)
  }
}

// 导出一些工具函数
export const utils = {
  formatDate: (date: Date) => date.toISOString(),
  generateId: () => Math.random().toString(36).substr(2, 9),
  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 导出一些常量
export const constants = {
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
  API_VERSION: '1.0.0'
}
