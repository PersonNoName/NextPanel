// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// 定义不需要认证的路径
const publicPaths = ['/login', '/register', '/signup', '/forgot-password'];
const authPaths = ['/login', '/register'];

// 定义需要忽略的静态资源扩展名
const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 检查是否是静态资源请求，如果是则直接放行
  if (staticExtensions.some(ext => path.endsWith(ext))) {
    return NextResponse.next();
  }
  
  // 检查是否是公共路径
  const isPublicPath = publicPaths.includes(path);
  const isAuthPath = authPaths.includes(path);
  
  // 从请求中获取token
  const token = request.cookies.get('authToken')?.value;
  // 更严格的token验证
  const hasValidToken = token && token.trim() !== '' && token !== 'undefined' && token !== 'null';
  
  console.log(`Middleware: path=${path}, isPublicPath=${isPublicPath}, hasValidToken=${hasValidToken}, token=${token}`);
  
  // 处理已登录用户访问认证路径（登录/注册页）
  if (isAuthPath && hasValidToken) {
    console.log('已登录用户访问认证页面，重定向到dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 处理未登录用户访问受保护路径
  if (!isPublicPath && !hasValidToken) {
    console.log('未登录用户访问受保护路径，重定向到login');
    
    // 确保清除可能存在的无效cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    
    return response;
  }
  
  // 其他情况，允许请求继续
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};