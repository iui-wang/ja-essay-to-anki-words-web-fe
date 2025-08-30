# Claude Code Project Guide - Japanese Anki Card Generator Frontend

## Project Overview
Modern frontend application built with React TypeScript for converting Japanese articles to Anki flashcards, supporting user authentication, task management, and real-time status tracking.

## Technology Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **HTTP**: Axios
- **Testing**: Playwright
- **Icons**: Lucide React

## Core Features
1. **User Authentication**: Registration/login/logout, JWT Token management
2. **Text Input**: Support for long text, scrollbars, validation
3. **Word Book Selection**: JLPT N1-N5 multi-select
4. **Task Management**: Create, status tracking, queue display
5. **File Download**: Anki card packages (.apkg) download
6. **Real-time Updates**: 5-second polling for task status

## Project Structure
```
src/
├── components/          # Reusable components
│   ├── LoginModal.tsx   # Authentication modal
│   ├── Navbar.tsx       # Navigation bar
│   ├── TaskQueue.tsx    # Task queue
│   └── TextInputSection.tsx  # Input area
├── contexts/            # Global state
│   └── AuthContext.tsx  # Authentication state management
├── services/            # API services
│   └── api.ts           # Unified API wrapper
├── constants/           # Configuration constants
│   └── config.ts        # Application configuration
└── tests/               # Test files
```

## Common Commands
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Production build
npm run preview                # Preview build results

# Testing
npx playwright test           # Run all tests
npx playwright test tests/e2e/auth.spec.ts  # Run specific tests
npx playwright show-report    # View test report

# Code checking
npm run lint                  # ESLint check
```

## API Integration
- Base URL: `http://localhost:5000`
- Authentication: JWT Token stored in localStorage
- Main endpoints:
  - `/api/auth/*` - User authentication
  - `/api/tasks/*` - Task management
  - `/api/download/*` - File download

## Development Standards
- Use TypeScript strict mode
- Components use functional components + Hooks
- State management prioritizes Context over global state
- API calls are uniformly encapsulated in services/api.ts
- Styles use Tailwind CSS atomic classes
- Tests use Playwright E2E tests

## Test Strategy
- **E2E Tests**: Cover complete user workflows
- **Manual Tests**: Detailed test plan in TEST_PLAN.md
- **Responsive Tests**: Desktop and mobile

## Deployment Configuration
- Development port: 5173
- Production build: dist/
- Environment variables: VITE_API_BASE_URL
- Backend dependency: Requires backend service on port 5000

## Common Issues
1. **CORS Issues**: Ensure backend has correct CORS configuration
2. **Token Expiration**: 401 errors will auto clear token and redirect
3. **Build Optimization**: Use Vite's code splitting
4. **Style Issues**: Check Tailwind config and class names