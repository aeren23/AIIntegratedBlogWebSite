# 🚀 AI-Integrated Blog Website

A full-stack modern blog platform built with **NestJS** and **React**, featuring AI-powered content generation, role-based access control, and a rich article editing experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [AI Integration](#ai-integration)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

AI-Integrated Blog Website is a comprehensive blogging platform designed for writers, editors, and teams. It combines modern web technologies with AI capabilities to provide a seamless content creation and management experience.

**Key Highlights:**
- 🤖 **AI-Powered**:  Integrated with Google Gemini AI for content generation and assistance
- 🔐 **Secure**: JWT-based authentication with role-based access control
- 📝 **Rich Editor**:  WYSIWYG editor with markdown support and syntax highlighting
- 👥 **Multi-Role**: Support for USER, AUTHOR, ADMIN, and SUPERADMIN roles
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Flowbite React
- 📊 **Admin Dashboard**: Comprehensive admin panel for content and user management
- 🔍 **Organized Content**: Categories and tags for better content organization
- 💬 **Comments**: Interactive commenting system for reader engagement

---

## ✨ Features

### Content Management
- 📄 **Article CRUD**:  Create, read, update, and delete articles
- 🏷️ **Categories & Tags**: Organize content with categories and tags
- 🖼️ **Image Uploads**: Support for article images and user avatars
- 📝 **Rich Text Editing**: Toast UI Editor with code syntax highlighting
- 🌐 **Slug Management**: SEO-friendly URLs for articles

### User Management
- 👤 **User Registration & Login**:  Secure authentication system
- 🎭 **Role-Based Access**: Four-tier role system (USER, AUTHOR, ADMIN, SUPERADMIN)
- 👥 **User Profiles**:  Customizable user profiles with avatars
- 📊 **Activity Logs**: Track user actions and system events

### AI Features
- 🤖 **AI Content Generation**: Google Gemini AI integration for content assistance
- 💡 **Smart Suggestions**: AI-powered writing suggestions (extensible)
- 🔌 **Provider Architecture**: Pluggable AI provider system (OpenAI, Gemini)

### Security & Performance
- 🔒 **JWT Authentication**:  Secure token-based authentication
- 🛡️ **Guards & Decorators**: Robust authorization with NestJS guards
- ✅ **Input Validation**: Class-validator for request validation
- 🗄️ **SQLite Database**: Lightweight, serverless database with TypeORM
- 🚀 **Optimized Frontend**: Vite for fast development and builds

---

## 🛠️ Tech Stack

### Backend (blog-backend)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **NestJS** | ^11.0.1 | Progressive Node.js framework |
| **TypeScript** | ^5.8.0 | Type-safe JavaScript |
| **TypeORM** | ^0.3.28 | ORM for database management |
| **SQLite** | ^5.1.7 | Embedded database |
| **Passport JWT** | ^4.0.1 | JWT authentication strategy |
| **bcryptjs** | ^3.0.3 | Password hashing |
| **@google/genai** | ^1.33.0 | Google Gemini AI integration |
| **Swagger** | ^11.2.3 | API documentation |

### Frontend (blog-frontend)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^19.2.0 | UI library |
| **TypeScript** | ~5.9.3 | Type-safe JavaScript |
| **Vite** | ^7.2.4 | Build tool & dev server |
| **React Router** | ^6.30.2 | Client-side routing |
| **Tailwind CSS** | ^4.1.18 | Utility-first CSS framework |
| **Flowbite React** | ^0.12.13 | UI components |
| **Toast UI Editor** | ^3.2.2 | Rich text editor |
| **Axios** | ^1.7.9 | HTTP client |
| **Prism.js** | ^1.29.0 | Syntax highlighting |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Public    │  │     User     │  │  Author/Admin   │   │
│  │   Routes    │  │    Routes    │  │     Routes      │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
│           │                │                   │            │
│           └────────────────┴───────────────────┘            │
│                            │                                │
│                       Auth Guard                            │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────┼────────────────────────────────┐
│                       Backend (NestJS)                       │
│                            │                                │
│                    API Gateway (/api)                       │
│                            │                                │
│  ┌──────────────┬──────────┼───────────┬──────────────┐    │
│  │     Auth     │  Articles │   Users   │     AI      │    │
│  │    Module    │   Module  │  Module   │   Module    │    │
│  └──────────────┴───────────┴───────────┴──────────────┘    │
│           │                │                   │            │
│      JWT Guard         TypeORM           Gemini AI          │
│           │                │                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │              SQLite Database (blog. db)             │    │
│  │   Users | Roles | Articles | Comments | Logs      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Backend Module Structure

```
blog-backend/src/
├── auth/              # Authentication & authorization
│   ├── guards/        # JWT & Role guards
│   ├── strategies/    # Passport JWT strategy
│   └── decorators/    # Custom decorators (@CurrentUser, @Roles)
├── users/             # User management
├── roles/             # Role management
├── articles/          # Article CRUD
├── categories/        # Category management
├── tags/              # Tag management
├── comments/          # Comment system
├── images/            # Image upload & management
├── logs/              # Activity logging
├── aiModule/          # AI integration
│   ├── providers/     # AI provider implementations
│   │   ├── geminiai. provider.ts
│   │   └── openai.provider.ts
│   └── interfaces/    # AI client interface
├── common/            # Shared utilities & DTOs
└── database/          # Database utilities
```

### Frontend Structure

```
blog-frontend/src/
├── app/
│   ├── public/        # Public pages (landing, login, register)
│   ├── user/          # User-only pages
│   ├── author/        # Author-specific pages
│   └── admin/         # Admin dashboard pages
├── api/               # API client functions
├── components/        # Reusable components
├── contexts/          # React contexts (Auth)
├── guards/            # Route guards
├── layouts/           # Layout components
└── types/             # TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/aeren23/AIIntegratedBlogWebSite.git
cd AIIntegratedBlogWebSite
```

2. **Install backend dependencies**

```bash
cd blog-backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../blog-frontend
npm install
```

### Environment Variables

Create a `.env` file in the **root directory** (one level above blog-backend/blog-frontend) with the following variables: 

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI Provider Configuration
GEMINI_API_KEY=your-google-gemini-api-key
AI_API_KEY=your-openai-api-key-if-using-openai

# Server Configuration (optional)
PORT=3000
```

**Important:**
- Replace `your-super-secret-jwt-key-change-in-production` with a strong, random secret
- Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- For OpenAI integration, get your API key from [OpenAI Platform](https://platform.openai.com/)

### Running the Application

#### Development Mode

1. **Start the backend server**

```bash
cd blog-backend
npm run start: dev
```

The backend will start at `http://localhost:3000`
- API endpoints:  `http://localhost:3000/api`
- Swagger documentation: `http://localhost:3000/api/docs`

2. **Start the frontend development server** (in a new terminal)

```bash
cd blog-frontend
npm run dev
```

The frontend will start at `http://localhost:5173`

#### Production Mode

**Backend:**

```bash
cd blog-backend
npm run build
npm run start:prod
```

**Frontend:**

```bash
cd blog-frontend
npm run build
npm run preview
```

---

## 📁 Project Structure

```
AIIntegratedBlogWebSite/
│
├── blog-backend/           # NestJS backend application
│   ├── src/
│   │   ├── aiModule/       # AI integration module
│   │   ├── articles/       # Article management
│   │   ├── auth/           # Authentication & authorization
│   │   ├── categories/     # Category management
│   │   ├── comments/       # Comments system
│   │   ├── common/         # Shared utilities
│   │   ├── database/       # Database utilities
│   │   ├── images/         # Image management
│   │   ├── logs/           # Activity logs
│   │   ├── roles/          # Role management
│   │   ├── tags/           # Tag management
│   │   ├── users/          # User management
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Application entry point
│   ├── uploads/            # Uploaded files directory
│   ├── blog. db             # SQLite database file
│   ├── package.json
│   └── tsconfig.json
│
├── blog-frontend/          # React frontend application
│   ├── src/
│   │   ├── app/            # Application pages
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── author/     # Author pages
│   │   │   ├── public/     # Public pages
│   │   │   └── user/       # User pages
│   │   ├── api/            # API integration
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── guards/         # Route protection
│   │   ├── layouts/        # Page layouts
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── . env                    # Environment variables
├── .gitignore
└── README.md               # This file
```

---

## 📚 API Documentation

Once the backend is running, access the **Swagger API documentation** at:

```
http://localhost:3000/api/docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (requires authentication)

#### Articles
- `GET /api/articles` - Get all published articles
- `GET /api/articles/:slug` - Get article by slug
- `POST /api/articles` - Create a new article (Author+)
- `PATCH /api/articles/:id` - Update article (Author+)
- `DELETE /api/articles/:id` - Delete article (Author+)

#### Categories & Tags
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin+)
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag (Admin+)

#### Users (Admin Only)
- `GET /api/users` - Get all users
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### AI
- `GET /api/ai/test? prompt=your-prompt` - Test AI integration

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow

1. **User Registration**
   - User submits registration form
   - Password is hashed using bcryptjs
   - User record is created with default 'USER' role
   - Activity log is created

2. **User Login**
   - User submits credentials (username/email + password)
   - Backend validates credentials
   - JWT token is generated with user ID, username, and roles
   - Token is returned to client (valid for 24 hours)

3. **Protected Routes**
   - Client includes JWT in `Authorization:  Bearer <token>` header
   - Backend validates token using JwtAuthGuard
   - User information is attached to request object
   - RolesGuard checks if user has required role

### Guards & Decorators

**JwtAuthGuard**:  Validates JWT token and ensures user is authenticated

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
getProtectedData() {
  // Only authenticated users can access
}
```

**RolesGuard**:  Checks if user has required role(s)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete(': id')
deleteUser(@Param('id') id: string) {
  // Only ADMIN users can access
}
```

**@CurrentUser() Decorator**: Extract user from request

```typescript
@Get('profile')
getProfile(@CurrentUser() user: JwtPayload) {
  return user;
}
```

---

## 🤖 AI Integration

### Google Gemini AI

The application integrates with **Google Gemini AI** for content generation and assistance. 

#### Configuration

Set your Gemini API key in `.env`:

```env
GEMINI_API_KEY=your-google-gemini-api-key
```

#### Usage

The AI module provides a pluggable architecture with support for multiple AI providers:

```typescript
// Current implementation uses Gemini
@Injectable()
export class GeminiClient implements AiClient {
  async generateContent(prompt: string): Promise<string> {
    // Uses gemini-2.5-flash model
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response. text;
  }
}
```

#### Testing AI

Test the AI integration: 

```bash
curl "http://localhost:3000/api/ai/test?prompt=Write a blog post about technology"
```

#### Extending with OpenAI

The architecture supports adding OpenAI or other providers:

```typescript
@Injectable()
export class OpenAiClient implements AiClient {
  async test(prompt: string): Promise<string> {
    // Implement OpenAI integration here
  }
}
```

---

## 👥 User Roles

The application implements a **4-tier role system**:

| Role | Permissions | Routes |
|------|------------|--------|
| **USER** | - View published articles<br>- Comment on articles<br>- Edit own profile | `/user/*` |
| **AUTHOR** | - All USER permissions<br>- Create articles<br>- Edit own articles<br>- Delete own articles | `/author/*` |
| **ADMIN** | - All AUTHOR permissions<br>- Manage all articles<br>- Manage categories & tags<br>- View activity logs<br>- Manage users | `/admin/*` |
| **SUPERADMIN** | - All ADMIN permissions<br>- Manage roles<br>- System configuration | `/admin/*` |

### Default Admin Account

On first run, a default admin account is created: 
- **Username**:  `admin`
- **Email**: `admin@example.com`
- **Password**: Check the console logs or database

**⚠️ Important**:  Change the default admin password after first login!

---

## 🎨 Frontend Features

### Landing Page
- Modern, responsive design
- Feature highlights
- Quick access to login/register

### User Dashboard
- Article browsing
- Profile management
- Comment on articles

### Author Dashboard
- Article management (create, edit, delete)
- Draft management
- Statistics overview

### Admin Panel
- Comprehensive admin dashboard
- User management
- Role assignment
- Category & tag management
- Activity logs viewer
- System statistics

---

## 🧪 Testing

### Backend Tests

```bash
cd blog-backend

# Unit tests
npm run test

# E2E tests
npm run test: e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd blog-frontend

# Run tests (when configured)
npm run test
```

---

## 📝 Development Notes

### Database

The application uses **SQLite** for simplicity and portability.  The database file `blog.db` is created automatically on first run.

**TypeORM Configuration**:
- Auto-synchronize enabled (development only)
- Entities auto-loaded from `/**/*.entity{.ts,.js}`

**Migrations** (for production):
```bash
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

### Code Style

- **ESLint** configured for both frontend and backend
- **Prettier** for code formatting

```bash
# Backend
npm run lint
npm run format

# Frontend
npm run lint
```

### CORS Configuration

CORS is enabled for development: 
- `http://localhost:5173` (Vite default)
- `http://localhost:3001`

Update in `blog-backend/src/main.ts` for production. 

---

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use different port in .env
PORT=3001
```

**2. Database locked**
```bash
# Delete and recreate database
cd blog-backend
rm blog.db
npm run start:dev  # Will recreate automatically
```

**3. JWT token expired**
- Login again to get a new token
- Token expiration is set to 24 hours

**4. AI API errors**
- Verify your API key in `.env`
- Check API quota limits
- Ensure internet connectivity

**5. Module not found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is **UNLICENSED** - see the package.json for details.

---

## 👨‍💻 Author

**aeren23**
- GitHub: [@aeren23](https://github.com/aeren23)
- Repository: [AIIntegratedBlogWebSite](https://github.com/aeren23/AIIntegratedBlogWebSite)

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Flowbite React](https://flowbite-react.com/) - UI components
- [Toast UI Editor](https://ui.toast.com/tui-editor) - Rich text editor
- [Google Gemini AI](https://ai.google. dev/) - AI integration
- [TypeORM](https://typeorm.io/) - Database ORM

---

## 🔮 Future Enhancements

- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Article versioning and history
- [ ] Advanced search and filtering
- [ ] Social media integration
- [ ] Real-time notifications
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support (i18n)
- [ ] Analytics dashboard
- [ ] SEO optimization tools
- [ ] Article scheduling
- [ ] More AI features (auto-tagging, content suggestions)

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](http://localhost:3000/api/docs)
2. Review the [Troubleshooting](#-troubleshooting) section
3. Open an issue on [GitHub](https://github.com/aeren23/AIIntegratedBlogWebSite/issues)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [aeren23](https://github.com/aeren23)

</div>
