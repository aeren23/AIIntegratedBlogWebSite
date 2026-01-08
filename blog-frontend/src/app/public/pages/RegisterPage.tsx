import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Label, Spinner, TextInput } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiCheck, HiX } from 'react-icons/hi';
import { registerApi } from '../../../api/auth.api';
import { getRoleRedirectPath, useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

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

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }
  if (username.length > 30) {
    return { valid: false, message: 'Username must be at most 30 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
};

const passwordRules = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'One special character (@$!%*?&.,#^()_-+=)', test: (p: string) => /[@$!%*?&.,#^()_\-+=]/.test(p) },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formState, setFormState] = useState<RegisterFormState>({
    username: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<RegisterFormState>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormState, boolean>>>({});

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

  const handleBlur = (field: keyof RegisterFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const resolveErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { errorMessage?: string; message?: string | string[] } | undefined;
      if (typeof data?.errorMessage === 'string' && data.errorMessage.trim()) {
        return data.errorMessage;
      }
      if (Array.isArray(data?.message)) {
        return data.message.join('. ');
      }
      if (typeof data?.message === 'string') {
        return data.message;
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Unable to create an account. Please try again.';
  };

  const passwordValidation = useMemo(() => {
    return passwordRules.map((rule) => ({
      ...rule,
      passed: rule.test(formState.password),
    }));
  }, [formState.password]);

  const isPasswordValid = passwordValidation.every((r) => r.passed);
  const isEmailValid = validateEmail(formState.email);
  const usernameValidation = validateUsername(formState.username);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Partial<RegisterFormState> = {};
    
    if (!formState.username.trim()) {
      nextErrors.username = 'Username is required.';
    } else if (!usernameValidation.valid) {
      nextErrors.username = usernameValidation.message;
    }
    
    if (!formState.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isEmailValid) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    
    if (!formState.password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (!isPasswordValid) {
      nextErrors.password = 'Password does not meet all requirements.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setTouched({ username: true, email: true, password: true });
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
      showSuccess('Account created successfully! Welcome!');
    } catch (error) {
      const errorMsg = resolveErrorMessage(error);
      setFormError(errorMsg);
      showError(errorMsg);
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
              color={fieldErrors.username || (touched.username && !usernameValidation.valid) ? 'failure' : touched.username && usernameValidation.valid ? 'success' : 'gray'}
              onChange={(event) => handleChange('username', event.target.value)}
              onBlur={() => handleBlur('username')}
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-500">{fieldErrors.username}</p>
            )}
            {!fieldErrors.username && touched.username && !usernameValidation.valid && (
              <p className="text-xs text-red-500">{usernameValidation.message}</p>
            )}
            <p className="text-xs text-gray-400">3-30 characters, letters, numbers, and underscores only</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <TextInput
              id="email"
              type="email"
              placeholder="johndoe@example.com"
              value={formState.email}
              color={fieldErrors.email || (touched.email && !isEmailValid && formState.email) ? 'failure' : touched.email && isEmailValid ? 'success' : 'gray'}
              onChange={(event) => handleChange('email', event.target.value)}
              onBlur={() => handleBlur('email')}
            />
            {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
            {!fieldErrors.email && touched.email && formState.email && !isEmailValid && (
              <p className="text-xs text-red-500">Please enter a valid email address</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              value={formState.password}
              color={fieldErrors.password || (touched.password && !isPasswordValid && formState.password) ? 'failure' : touched.password && isPasswordValid ? 'success' : 'gray'}
              onChange={(event) => handleChange('password', event.target.value)}
              onBlur={() => handleBlur('password')}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
            
            {/* Password requirements indicator */}
            {(formState.password || touched.password) && (
              <div className="mt-2 space-y-1.5 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Password requirements:</p>
                {passwordValidation.map((rule) => (
                  <div key={rule.key} className="flex items-center gap-2">
                    {rule.passed ? (
                      <HiCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <HiX className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={`text-xs ${rule.passed ? 'text-green-600' : 'text-gray-500'}`}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
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
