import { Button, Card, Badge } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineDocumentText, HiOutlineChartBar } from 'react-icons/hi';

const cardTheme = {
  root: {
    base: 'flex rounded-xl border bg-white shadow-sm',
    children: 'flex h-full flex-col justify-center gap-4 p-6',
  },
};

const LandingPage = () => {
  return (
    <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-teal-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Modern blogging workspace
        </div>
        <div className="space-y-5">
          <h1 className="text-4xl font-bold leading-tight text-gray-800 md:text-5xl">
            Publish faster. <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Collaborate smarter.</span> Reach the right audience.
          </h1>
          <p className="text-lg leading-relaxed text-gray-600">
            A full-stack blog platform built for writers, editors, and teams. Manage drafts,
            organize content, and ship stories with confidence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button as={Link} to="/register" color="teal" size="lg" className="px-6 shadow-lg shadow-teal-500/25">
            Get Started Free
          </Button>
          <Button as={Link} to="/login" color="light" size="lg" className="border-gray-200 px-6 text-gray-700 hover:bg-gray-50">
            Sign In
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge color="info" className="bg-teal-100 px-3 py-1.5 text-teal-700">
            <span className="flex items-center gap-1.5">
              <HiOutlineShieldCheck className="h-3.5 w-3.5" />
              Role-based access
            </span>
          </Badge>
          <Badge color="success" className="bg-emerald-100 px-3 py-1.5 text-emerald-700">
            JWT-secured
          </Badge>
          <Badge color="info" className="bg-cyan-100 px-3 py-1.5 text-cyan-700">
            React + NestJS
          </Badge>
        </div>
      </section>

      <section className="grid gap-4">
        <Card theme={cardTheme} className="border-gray-100 !bg-white hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100">
              <HiOutlineShieldCheck className="h-5 w-5 text-teal-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">Designed for every role</h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Authors focus on writing. Admins manage everything. Readers get a clean,
                curated experience.
              </p>
            </div>
          </div>
        </Card>
        <Card theme={cardTheme} className="border-gray-100 !bg-white hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
              <HiOutlineDocumentText className="h-5 w-5 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">Structured, searchable content</h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Categories, tags, and audit logs keep your publishing workflow organized and
                compliant.
              </p>
            </div>
          </div>
        </Card>
        <Card theme={cardTheme} className="border-gray-100 !bg-white hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
              <HiOutlineChartBar className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">Built for scale</h2>
              <p className="text-sm leading-relaxed text-gray-500">
                NestJS backend, React + Vite frontend, and a clean API layer ready for growth.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default LandingPage;
