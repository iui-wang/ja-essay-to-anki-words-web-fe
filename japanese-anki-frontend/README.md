# Japanese Anki Card Generator - Frontend

A modern frontend application built with React TypeScript for converting Japanese articles into Anki flashcards.

## 🚀 Features

### Core Features
- ✅ **User Authentication**: Registration, login, logout
- ✅ **Text Input**: Support for long text input with scrollbars
- ✅ **Word Book Selection**: JLPT N1-N5 multi-select functionality
- ✅ **Task Management**: Create, track, and manage parsing tasks
- ✅ **File Download**: Generate Anki card packages (APKG format)
- ✅ **Real-time Status**: Real-time task progress updates

### User Experience
- 🎨 Modern UI design, clean and beautiful
- 📱 Responsive layout, compatible with desktop and mobile
- ⚡ Instant feedback, real-time operation status display
- 🛡️ Friendly error handling and validation

## 🏁 Quick Start

### Environment Requirements
- Node.js 18+
- npm or yarn

### Install Dependencies
```bash
cd japanese-anki-frontend
npm install
```

### Start Development Server
```bash
npm run dev
```
Application will start at http://localhost:5173

### Production Build
```bash
npm run build
```

## 📖 Usage Instructions

### 1. User Registration/Login
- Click "Login/Register" in the top right
- New users select "Register", fill in username, email, and password
- Existing users login directly
- After login, username and logout button display in top right

### 2. Create Task
1. **Input Text**: Enter Japanese text in the large text box on the left
2. **Select Word Books**: Check required JLPT levels (N1-N5)
3. **Submit Task**: Click "Generate Flashcards"
4. **Wait Processing**: Task will automatically add to queue

### 3. Download Cards
1. **Check Status**: View task progress in the right task queue
2. **Download Files**: Click "Download" button after task completion
3. **Import Anki**: Import downloaded .apkg file into Anki

## 🏗️ Project Structure

```
japanese-anki-frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── LoginModal.tsx   # Login/Register modal
│   │   ├── Navbar.tsx       # Top navigation bar
│   │   ├── TaskQueue.tsx    # Task queue component
│   │   └── TextInputSection.tsx  # Text input area
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── services/            # API services
│   │   └── api.ts           # API call encapsulation
│   ├── constants/           # Constant configuration
│   │   └── config.ts        # Application configuration
│   └── tests/               # Test files
├── playwright.config.ts     # Playwright configuration
└── package.json
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Testing**: Playwright
- **Icons**: Lucide React

## 🔧 Development Configuration

### Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000
```

### Backend Service
Ensure backend service is running at http://localhost:5000

## 🧪 Testing

### Test Coverage
- ✅ User authentication flow
- ✅ Task creation and management
- ✅ UI layout and responsive design
- ✅ Integration testing

### Run Tests
```bash
# Run all tests
npm run test:e2e

# Run specific tests
npx playwright test tests/e2e/auth.spec.ts
```

Detailed test plan see `TEST_PLAN.md`

## 📱 Compatibility

- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Devices**: Desktop, tablet, mobile

## 🚀 Deployment

### Production Environment
1. Build project: `npm run build`
2. Deploy build files to web server
3. Configure reverse proxy to API service

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📄 License

MIT License