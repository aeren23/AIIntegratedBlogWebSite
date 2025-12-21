import { Alert, Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { HiOutlineLockClosed } from 'react-icons/hi';

const UnauthorizedPage = () => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-50 to-orange-100">
        <HiOutlineLockClosed className="h-10 w-10 text-amber-500" />
      </div>
      <Alert color="warning" className="w-full">
        <span className="font-medium">Access denied.</span> You do not have permission to view
        this page.
      </Alert>
      <div className="flex flex-wrap gap-3">
        <Button as={Link} to="/" color="teal" className="shadow-md shadow-teal-500/20">
          Back to home
        </Button>
        <Button as={Link} to="/login" color="light" className="border-gray-200 text-gray-700">
          Login with another account
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
