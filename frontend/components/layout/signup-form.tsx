"use client"
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
import { useCreateUser } from "@/hooks/useUserQueryHooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { mutate, isPending } = useCreateUser();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const email = form.elements.namedItem('email') as HTMLInputElement;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const confirmPassword = form.elements.namedItem('confirm-password') as HTMLInputElement;

    if (password.value !== confirmPassword.value) {
      toast.error('密码不匹配');
      return;
    }

    const signupData = {
      username: name.value,
      email: email.value,
      password: password.value,
    };
    mutate(signupData, {
      onSuccess: () => {
        // 存储token
        router.push('/dashboard');
      },
    });
  }
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>注册账号</CardTitle>
        <CardDescription>
          请输入您的信息以创建账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">用户名</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <FieldDescription>
                我们将使用此邮箱联系您。我们不会将您的邮箱分享给其他任何人。
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription>
                密码必须至少包含8个字符。
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                确认密码
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>
                请确认您的密码。
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">注册账号</Button>
                <FieldDescription className="px-6 text-center">
                  已经有账号了？ <a href="/login">登录</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
