import { type FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Card, Label, Spinner, TextInput } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginApi } from '../../../api/auth.api';
import { getRoleRedirectPath, useAuth } from '../../../contexts/AuthContext';

const cardTheme = {
  root: {
    base: 'flex rounded-xl border bg-white shadow-lg',
    children: 'flex h-full flex-col justify-center gap-4 p-6',
  },
};

type LoginFormState = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [formState, setFormState] = useState<LoginFormState>({
    username: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormState>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const path = getRoleRedirectPath(user.roles);
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const handleChange = (field: keyof LoginFormState, value: string) => {
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
    return 'Unable to sign in. Please try again.';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Partial<LoginFormState> = {};
    if (!formState.username.trim()) {
      nextErrors.username = 'Username or email is required.';
    }
    if (!formState.password.trim()) {
      nextErrors.password = 'Password is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginApi({
        username: formState.username.trim(),
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
          <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
          <p className="text-sm text-gray-500">Sign in to continue managing your content.</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">Username or email</Label>
            <TextInput
              id="username"
              type="text"
              placeholder="jane@example.com"
              value={formState.username}
              color={fieldErrors.username ? 'failure' : 'gray'}
              onChange={(event) => handleChange('username', event.target.value)}
              className="focus:ring-teal-500"
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-500">{fieldErrors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
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
              <span className="font-medium">Login failed.</span> {formError}
            </Alert>
          )}

          <Button type="submit" color="teal" className="w-full shadow-md shadow-teal-500/20" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="mr-2" />}
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>

      <Card theme={cardTheme} className="border-gray-100 !bg-white text-center">
        <p className="text-sm text-gray-600">
          New here?{' '}
          <Link className="font-semibold text-teal-600 hover:text-teal-700 hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
