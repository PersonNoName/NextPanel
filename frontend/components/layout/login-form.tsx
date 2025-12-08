'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { redirect } from 'next/navigation';
import { useLogin } from "@/hooks/useUserQueryHooks";
import { useRouter } from "next/navigation"
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { mutate, isPending } = useLogin();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const usernameOrEmail = form.elements.namedItem('usernameOrEmail') as HTMLInputElement;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const loginData = {
      usernameOrEmail: usernameOrEmail.value,
      password: password.value,
    };
    mutate(loginData, {
      onSuccess: () => {
        // 存储token
        setTimeout(() => {
          router.push('/dashboard');
        }, 500); // 短暂延迟，确保cookie设置完成
      },
    });
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>
            输入用户名和密码登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="usernameOrEmail">用户名</FieldLabel>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder=""
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">密码</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    忘记密码？
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending} >
                  {isPending ? "登录中..." : "登录"}
                </Button>
                <FieldDescription className="text-center">
                  没有账号? <a href="/signup">注册</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
