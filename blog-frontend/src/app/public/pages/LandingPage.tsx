import { Button, Card, Badge } from 'flowbite-react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiSparkles,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlineTag,
  HiOutlineCode,
  HiOutlineLightningBolt,
  HiArrowRight,
  HiOutlineCheck,
} from 'react-icons/hi';
import usePageMeta from '../../../hooks/usePageMeta';

const cardTheme = {
  root: {
    base: 'flex rounded-xl border bg-white shadow-sm',
    children: 'flex h-full flex-col justify-center gap-4 p-6',
  },
};

const LandingPage = () => {
  usePageMeta({
    title: 'AI Blog | Modern AI-Powered Blogging Platform',
    description:
      'AI-powered modern blog platform. Automatic article summarization, smart content management, and powerful author tools.',
  });

  const features = [
    {
      icon: HiSparkles,
      title: 'AI Article Summarization',
      description: 'Automatically summarize your articles with Gemini 2.5 Flash. Provide quick previews for your readers.',
      gradient: 'from-violet-100 to-purple-100',
      iconColor: 'text-violet-600',
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Role-Based Authorization',
      description: 'Secure access control with User, Author, Admin, and Superadmin roles.',
      gradient: 'from-teal-100 to-cyan-100',
      iconColor: 'text-teal-600',
    },
    {
      icon: HiOutlineDocumentText,
      title: 'Rich Content Editor',
      description: 'Enhanced writing experience with Markdown support, image uploads, and live preview.',
      gradient: 'from-amber-100 to-orange-100',
      iconColor: 'text-amber-600',
    },
    {
      icon: HiOutlineChatAlt2,
      title: 'Comment System',
      description: 'Nested replies, moderation tools, and seamless user engagement.',
      gradient: 'from-blue-100 to-indigo-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: HiOutlineTag,
      title: 'Categories & Tags',
      description: 'Categorize and tag your content to make it easily discoverable.',
      gradient: 'from-emerald-100 to-green-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: HiOutlineUserGroup,
      title: 'Multi-User Support',
      description: 'Customized panels for authors, editors, and readers.',
      gradient: 'from-rose-100 to-pink-100',
      iconColor: 'text-rose-600',
    },
  ];

  const techStack = [
    { name: 'React 18', color: 'bg-cyan-100 text-cyan-700' },
    { name: 'TypeScript', color: 'bg-blue-100 text-blue-700' },
    { name: 'NestJS', color: 'bg-red-100 text-red-700' },
    { name: 'TypeORM', color: 'bg-orange-100 text-orange-700' },
    { name: 'SQLite', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Gemini AI', color: 'bg-violet-100 text-violet-700' },
    { name: 'Tailwind CSS', color: 'bg-teal-100 text-teal-700' },
    { name: 'Flowbite', color: 'bg-indigo-100 text-indigo-700' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-violet-700">
            <HiSparkles className="h-4 w-4 animate-pulse text-violet-500" />
            AI-Powered Blog Platform
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-bold leading-tight text-gray-800 md:text-5xl lg:text-6xl">
              Blog Experience{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
              A modern full-stack blog platform. Transform your blogging experience with AI-powered
              summarization, smart content management, powerful author tools, and a user-friendly
              interface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              as={Link}
              to="/register"
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-purple-700"
            >
              Get Started
              <HiArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              as={Link}
              to="/articles"
              color="light"
              size="lg"
              className="border-gray-200 px-6 text-gray-700 hover:bg-gray-50"
            >
              Explore Articles
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <HiOutlineCheck className="h-5 w-5 text-emerald-500" />
              Free to register
            </span>
            <span className="flex items-center gap-2">
              <HiOutlineCheck className="h-5 w-5 text-emerald-500" />
              AI features included
            </span>
            <span className="flex items-center gap-2">
              <HiOutlineCheck className="h-5 w-5 text-emerald-500" />
              Open source
            </span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-200/50 via-purple-200/50 to-indigo-200/50 blur-2xl" />
          <div className="relative rounded-2xl border border-violet-100 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <HiSparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">AI Summary Generator</p>
                  <p className="text-xs text-gray-500">Gemini 2.5 Flash</p>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-4">
                <p className="text-sm italic text-gray-600">
                  "This article explores modern web development practices and how AI integration
                  adds value to blog platforms..."
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>✨ Generated by AI</span>
                <span>~2 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-10">
        <div className="text-center">
          <Badge className="mb-4 bg-violet-100 px-4 py-2 text-violet-700">
            <HiOutlineLightningBolt className="mr-1.5 inline h-4 w-4" />
            Features
          </Badge>
          <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
            Tools for Every Need
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            A comprehensive feature set designed for authors, editors, and readers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              theme={cardTheme}
              className="border-gray-100 !bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-50 to-gray-100 p-8 md:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <Badge className="bg-slate-200 px-4 py-2 text-slate-700">
              <HiOutlineCode className="mr-1.5 inline h-4 w-4" />
              Tech Stack
            </Badge>
            <h2 className="text-3xl font-bold text-gray-800">Modern & Reliable Infrastructure</h2>
            <p className="text-gray-600">
              Built with industry-standard technologies for a scalable and maintainable
              architecture. Every layer from frontend to backend, database to AI integration,
              has been carefully designed.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <HiOutlineChartBar className="h-5 w-5 text-violet-600" />
                <span className="text-gray-700">RESTful API design</span>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlineShieldCheck className="h-5 w-5 text-violet-600" />
                <span className="text-gray-700">JWT-based authentication</span>
              </div>
              <div className="flex items-center gap-3">
                <HiSparkles className="h-5 w-5 text-violet-600" />
                <span className="text-gray-700">Google Gemini AI integration</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
            {techStack.map((tech, index) => (
              <span
                key={index}
                className={`rounded-full px-4 py-2 text-sm font-medium ${tech.color}`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-center md:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Start Your Blog Journey Today
          </h2>
          <p className="mx-auto max-w-xl text-lg text-violet-100">
            Create a free account, explore AI-powered features, and publish your first article.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              as={Link}
              to="/register"
              size="lg"
              className="bg-white px-8 text-violet-700 shadow-lg hover:bg-violet-50"
            >
              Sign Up Free
            </Button>
            <Button
              as={Link}
              to="/login"
              color="light"
              size="lg"
              className="border-white/30 bg-transparent px-6 text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
        <p>
          This project was created as part of a Full Stack Web Development course.
        </p>
        <p className="mt-2">
          <span className="font-medium text-gray-700">React</span> +{' '}
          <span className="font-medium text-gray-700">NestJS</span> +{' '}
          <span className="font-medium text-gray-700">Gemini AI</span>
        </p>
      </section>
    </div>
  );
};

export default LandingPage;
