import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormField } from '@/components/forms/FormField';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import { useLogin } from '@/features/auth/hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(
      { payload: { email: values.email, password: values.password }, rememberMe },
      {
        onSuccess: () => {
          const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';
          navigate(redirectTo, { replace: true });
        },
      }
    );
  };

  return (
    <AuthLayout
      eyebrow="Carrier Operations Platform"
      title="Every carrier relationship, in one signal."
      description="Monitor traffic, reconcile revenue, and manage vendor and customer relationships from a single, unified control plane."
    >
      <div className="mb-8 space-y-1.5">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Sign in</h2>
        <p className="text-sm text-ink-500">Enter your credentials to access your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <label className="flex select-none items-center gap-2 text-ink-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-border-strong text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loginMutation.isPending}>
          Sign in
        </Button>

        <p className="text-center text-sm text-ink-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
