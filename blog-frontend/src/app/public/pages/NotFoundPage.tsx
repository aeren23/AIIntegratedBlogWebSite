import { Button, Card } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const cardTheme = {
  root: {
    base: 'flex rounded-xl border bg-white shadow-lg',
    children: 'flex h-full flex-col justify-center gap-4 p-6',
  },
};

const NotFoundPage = () => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-slate-100">
        <HiOutlineExclamationCircle className="h-10 w-10 text-gray-400" />
      </div>
      <Card theme={cardTheme} className="w-full border-gray-100 !bg-white text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">404</p>
          <h2 className="text-3xl font-bold text-gray-800">Page not found</h2>
          <p className="text-gray-500">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button as={Link} to="/" color="teal" className="shadow-md shadow-teal-500/20">
          Back to home
        </Button>
        <Button as={Link} to="/login" color="light" className="border-gray-200 text-gray-700">
          Go to login
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
