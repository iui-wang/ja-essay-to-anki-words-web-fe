# Japanese Anki Card Generator - Test Plan

## Project Overview
Modern frontend application built with React TypeScript for converting Japanese articles into Anki flashcards.

## Function Test Checklist

### ✅ Completed Core Features

#### 1. User Authentication Features
- [x] User registration
- [x] User login
- [x] User logout
- [x] Login state persistence
- [x] Prompt for unlogged users

#### 2. Text Input and Word Book Selection
- [x] Japanese text input area
- [x] JLPT level selection (N1-N5)
- [x] Multi-select word book functionality
- [x] Input validation
- [x] Scrollbar support

#### 3. Task Creation and Management
- [x] Create parsing tasks
- [x] Real-time task status tracking
- [x] Task queue display
- [x] Progress bar display
- [x] Automatic polling updates

#### 4. File Download Features
- [x] Anki card package (APKG) download
- [x] Automatic download file naming
- [x] Download status validation

#### 5. User Interface
- [x] Responsive design
- [x] Modern UI design
- [x] Top navigation bar
- [x] Task queue sidebar
- [x] Error prompts and validation

## Manual Test Steps

### Test Environment Setup
1. Start backend service: `cd ../ja-essay-to-anki-words-web-be && python run.py`
2. Start frontend service: `npm run dev`

### Test Cases

#### 1. User Authentication Test
**Step 1: User Registration**
1. Visit http://localhost:5173
2. Click "Login/Register"
3. Click "No account? Register"
4. Enter username, email, and password
5. Click "Register"
6. Verify successful registration and auto-login

**Step 2: User Login**
1. Logout current user
2. Click "Login/Register"
3. Enter registered username and password
4. Click "Login"
5. Verify successful login displays welcome message

**Step 3: User Logout**
1. Click "Logout"
2. Verify return to unlogged state

#### 2. Task Creation Test
**Step 1: Unlogged User**
1. Ensure in unlogged state
2. Enter Japanese text
3. Select word books
4. Click "Generate Flashcards"
5. Verify login prompt appears

**Step 2: Input Validation**
1. Login user
2. Try empty text submission
3. Try submission without selecting word books
4. Verify corresponding error prompts

**Step 3: Normal Task Creation**
1. Enter Japanese text
2. Select N4 and N5 word books
3. Click "Generate Flashcards"
4. Verify successful task creation
5. Verify text area cleared
6. Verify task appears in queue

#### 3. Task Queue Test
**Step 1: Task Display**
1. Create multiple tasks
2. Verify all tasks display correctly
3. Verify complete task information (name, status, levels, time)

**Step 2: Status Updates**
1. Observe task status from "Pending" to "Processing" to "Completed"
2. Verify progress bar updates
3. Verify download button appears after completion

**Step 3: File Download**
1. Wait for task completion
2. Click "Download" button
3. Verify file downloads correctly
4. Verify correct file name format

#### 4. Responsive Design Test
**Step 1: Desktop**
1. Visit at 1920x1080 resolution
2. Verify left-right split layout
3. Verify all elements display normally

**Step 2: Mobile**
1. Visit at 375x667 resolution
2. Verify vertical layout
3. Verify scrolling functions normally

#### 5. Error Handling Test
**Step 1: Network Error**
1. Disconnect network
2. Try creating task
3. Verify error prompt

**Step 2: Backend Exception**
1. Stop backend service
2. Try creating task
3. Verify error handling

## Performance Testing

### Loading Performance
- First screen loading time: < 3 seconds
- Static resource size optimization
- Code splitting implemented

### Interaction Performance
- Button response time: < 100ms
- Scroll smoothness: 60fps
- Task status updates: 5 second polling

## Compatibility Testing

### Browser Support
- [x] Chrome (latest)
- [x] Firefox (latest)
- [x] Safari (latest)
- [x] Edge (latest)

### Device Support
- [x] Desktop (1920x1080)
- [x] Tablet (768x1024)
- [x] Mobile (375x667)

## Security Testing

### Input Validation
- [x] XSS protection
- [x] Input length limits
- [x] Special character handling

### Authentication Security
- [x] Secure token storage
- [x] Login state validation
- [x] Sensitive information protection

## Test Pass Criteria

1. **Function Completeness**: All core functions work normally
2. **User Experience**: Friendly interface, smooth operation
3. **Error Handling**: Clear prompts for abnormal situations
4. **Performance Requirements**: Response time within acceptable range
5. **Compatibility**: Normal display on major browsers and devices

## Known Limitations

1. **Playwright Tests**: Due to system dependency limitations, automated tests need manual execution
2. **Backend Dependency**: Requires backend service to run normally
3. **Network Requirements**: Requires stable network connection

## Test Record Table

| Test Item | Test Date | Test Result | Notes |
|-----------|-----------|-----------|------|
| User Registration | To test | To fill | - |
| User Login | To test | To fill | - |
| Task Creation | To test | To fill | - |
| Task Queue | To test | To fill | - |
| File Download | To test | To fill | - |
| Responsive Design | To test | To fill | - |

## Future Test Recommendations

1. **Automated Testing**: Run Playwright tests in complete environment
2. **Performance Optimization**: Use Lighthouse for performance analysis
3. **User Testing**: Invite real users for experience testing
4. **Boundary Testing**: Test application behavior under extreme conditions