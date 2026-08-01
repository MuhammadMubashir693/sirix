import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormField } from '@/components/forms/FormField';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas';
import { useRegister } from '@/features/auth/hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  if (submitted) {
    return (
      <AuthLayout
        eyebrow="Carrier Operations Platform"
        title="Every carrier relationship, in one signal."
        description="Monitor traffic, reconcile revenue, and manage vendor and customer relationships from a single, unified control plane."
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-100 text-success-500">
            <CheckCircle2 className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Account created</h2>
            <p className="text-sm text-ink-500">
              Your account has been created successfully. You can now sign in with your credentials.
            </p>
          </div>
          <Button className="w-full" onClick={() => navigate('/login', { replace: true })}>
            Go to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Carrier Operations Platform"
      title="Every carrier relationship, in one signal."
      description="Monitor traffic, reconcile revenue, and manage vendor and customer relationships from a single, unified control plane."
    >
      <div className="mb-8 space-y-1.5">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Create an account</h2>
        <p className="text-sm text-ink-500">Get started with Sirix in a few seconds.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
            <Input
              id="firstName"
              autoComplete="given-name"
              placeholder="Jane"
              invalid={!!errors.firstName}
              {...register('firstName')}
            />
          </FormField>

          <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
            <Input
              id="lastName"
              autoComplete="family-name"
              placeholder="Doe"
              invalid={!!errors.lastName}
              {...register('lastName')}
            />
          </FormField>
        </div>

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

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters, with an uppercase letter, lowercase letter, and number."
          required
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" className="w-full" loading={registerMutation.isPending}>
          Create account
        </Button>

        <p className="text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
