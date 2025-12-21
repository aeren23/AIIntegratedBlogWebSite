import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Label, Spinner, TextInput } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { registerApi } from '../../../api/auth.api';
import { getRoleRedirectPath, useAuth } from '../../../contexts/AuthContext';

const cardTheme = {
  root: {
    base: 'flex rounded-xl border bg-white shadow-lg',
    children: 'flex h-full flex-col justify-center gap-4 p-6',
  },
};

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [formState, setFormState] = useState<RegisterFormState>({
    username: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<RegisterFormState>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(
    () => (user ? getRoleRedirectPath(user.roles) : '/'),
    [user]
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath, user]);

  const handleChange = (field: keyof RegisterFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const resolveErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const apiMessage = (error.response?.data as { errorMessage?: string } | undefined)
        ?.errorMessage;
      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return apiMessage;
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Unable to create an account. Please try again.';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Partial<RegisterFormState> = {};
    if (!formState.username.trim()) {
      nextErrors.username = 'Username is required.';
    }
    if (!formState.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!formState.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!formState.password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (formState.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerApi({
        username: formState.username.trim(),
        email: formState.email.trim(),
        password: formState.password,
      });
      await login(response.accessToken);
    } catch (error) {
      setFormError(resolveErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card theme={cardTheme} className="border-gray-100 !bg-white">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
          <p className="text-sm text-gray-500">
            Start publishing or managing content with secure access.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
            <TextInput
              id="username"
              type="text"
              placeholder="johndoe"
              value={formState.username}
              color={fieldErrors.username ? 'failure' : 'gray'}
              onChange={(event) => handleChange('username', event.target.value)}
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-500">{fieldErrors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <TextInput
              id="email"
              type="email"
              placeholder="johndoe@example.com"
              value={formState.email}
              color={fieldErrors.email ? 'failure' : 'gray'}
              onChange={(event) => handleChange('email', event.target.value)}
            />
            {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <TextInput
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={formState.password}
              color={fieldErrors.password ? 'failure' : 'gray'}
              onChange={(event) => handleChange('password', event.target.value)}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {formError && (
            <Alert color="failure">
              <span className="font-medium">Registration failed.</span> {formError}
            </Alert>
          )}

          <Button type="submit" color="teal" className="w-full shadow-md shadow-teal-500/20" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="mr-2" />}
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </Card>

      <Card theme={cardTheme} className="border-gray-100 !bg-white text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="font-semibold text-teal-600 hover:text-teal-700 hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
