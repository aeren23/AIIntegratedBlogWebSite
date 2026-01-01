import { useEffect, useState } from 'react';
import { Alert, Badge, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchCategories, type Category } from '../../../api/category.api';
import usePageMeta from '../../../hooks/usePageMeta';

const resolveErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    const apiMessage = (err.response?.data as { errorMessage?: string } | undefined)
      ?.errorMessage;
    if (apiMessage) {
      return apiMessage;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unable to load categories.';
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: 'Categories | Blog',
    description: 'Browse articles by category.',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(resolveErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Categories</p>
        <h1 className="text-3xl font-semibold text-slate-900">Browse by category</h1>
        <p className="text-sm text-slate-600">
          Pick a category to see the latest articles.
        </p>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Category error.</span> {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner size="sm" />
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-teal-100/60 bg-white/90 p-8 text-center text-slate-500">
          No categories found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-600">
                  {category.name}
                </h2>
                <Badge className="!border !border-teal-200 !bg-teal-50 !text-teal-700">
                  View
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Explore stories in {category.name}.
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
