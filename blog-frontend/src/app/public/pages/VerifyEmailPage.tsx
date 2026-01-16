import { useEffect, useState } from 'react';
import { Alert, Button, Card, Spinner } from 'flowbite-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

const cardTheme = {
  root: {
    base: 'flex rounded-xl border bg-white shadow-lg',
    children: 'flex h-full flex-col justify-center gap-4 p-6',
  },
};

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationResult({
          success: false,
          message: 'Invalid verification link. No token provided.',
        });
        setIsVerifying(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`);
        
        if (response.data.success) {
          setVerificationResult({
            success: true,
            message: response.data.data?.message || 'Email verified successfully!',
          });
        } else {
          setVerificationResult({
            success: false,
            message: response.data.errorMessage || 'Verification failed',
          });
        }
      } catch (error) {
        let errorMessage = 'An error occurred during verification';
        if (axios.isAxiosError(error)) {
          const data = error.response?.data as { errorMessage?: string; message?: string } | undefined;
          errorMessage = data?.errorMessage || data?.message || errorMessage;
        }
        setVerificationResult({
          success: false,
          message: errorMessage,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (isVerifying) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <Card theme={cardTheme} className="border-gray-100 !bg-white">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Spinner size="xl" color="teal" />
            <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
            <p className="text-sm text-gray-500">Please wait while we verify your email address.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card theme={cardTheme} className="border-gray-100 !bg-white">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          {verificationResult?.success ? (
            <>
              <HiCheckCircle className="h-20 w-20 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
              <p className="text-center text-gray-600">{verificationResult.message}</p>
              <Alert color="success" className="w-full">
                <span className="font-medium">Success!</span> Your email has been verified. You can now fully access your account.
              </Alert>
              <div className="flex gap-3 mt-4">
                <Button color="teal" onClick={() => navigate('/articles')}>
                  Go to Articles
                </Button>
                <Button color="gray" outline onClick={() => navigate('/profile')}>
                  View Profile
                </Button>
              </div>
            </>
          ) : (
            <>
              <HiXCircle className="h-20 w-20 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
              <p className="text-center text-gray-600">{verificationResult?.message}</p>
              <Alert color="failure" className="w-full">
                <span className="font-medium">Error!</span> {verificationResult?.message}
              </Alert>
              <div className="flex gap-3 mt-4">
                <Link to="/login">
                  <Button color="teal">
                    Go to Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button color="gray" outline>
                    Register Again
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
