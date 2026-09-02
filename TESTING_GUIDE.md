# GreenQuest Testing Guide

## Overview

This document provides a comprehensive guide to testing the GreenQuest application, covering unit testing, black box testing, and white box testing methodologies.

## Testing Infrastructure

### Dependencies

The testing setup includes the following key dependencies:

- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing utilities
- **Supertest**: HTTP assertion library for API testing
- **MSW**: Mock Service Worker for API mocking
- **@testing-library/user-event**: User interaction simulation

### Configuration Files

- `jest.config.js`: Jest configuration
- `src/setupTests.ts`: Test setup and global mocks
- `package.json`: Test scripts configuration

## Testing Types

### 1. Unit Testing

Unit tests focus on testing individual components, functions, or modules in isolation.

#### Component Unit Tests

**Location**: `src/components/__tests__/`

**Example**: `QuizGame.test.tsx`

```typescript
describe('QuizGame Component - Unit Tests', () => {
  it('should render the first question correctly', () => {
    render(<TestWrapper><QuizGame /></TestWrapper>);
    
    expect(screen.getByText('Question 1/3')).toBeInTheDocument();
    expect(screen.getByText('Which of these items is NOT recyclable?')).toBeInTheDocument();
  });
});
```

**Key Features**:
- Tests component rendering
- Tests user interactions
- Tests state changes
- Tests prop handling
- Tests accessibility

#### Service Unit Tests

**Location**: `src/services/__tests__/`

**Example**: `api.test.ts`

```typescript
describe('API Service - Unit Tests', () => {
  it('should register a new user successfully', async () => {
    const userData = { fullName: 'John Doe', phone: '1234567890' };
    const mockResponse = { data: { message: 'Success' } };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    const result = await authAPI.register(userData);
    
    expect(result).toEqual(mockResponse.data);
  });
});
```

**Key Features**:
- Tests API calls
- Tests error handling
- Tests data transformation
- Tests authentication

#### Context Unit Tests

**Location**: `src/contexts/__tests__/`

**Example**: `AuthContext.test.tsx`

```typescript
describe('AuthContext - Unit Tests', () => {
  it('should login user successfully', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    
    const loginBtn = screen.getByTestId('login-btn');
    act(() => loginBtn.click());
    
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });
});
```

### 2. Black Box Testing

Black box tests focus on testing the system from the outside without knowledge of internal implementation.

#### API Endpoint Testing

**Location**: `tests/integration/api-endpoints.test.js`

```javascript
describe('API Endpoints - Black Box Tests', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      fullName: 'New User',
      phone: '9876543210',
      username: 'newuser',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });
});
```

**Key Features**:
- Tests complete API workflows
- Tests authentication flows
- Tests data validation
- Tests error responses
- Tests database interactions

#### User Workflow Testing

**Example**: Complete user registration and login flow

```javascript
it('should complete full user registration and login workflow', async () => {
  // Step 1: Register user
  const userData = { /* user data */ };
  const registerResponse = await request(app)
    .post('/api/register')
    .send(userData)
    .expect(201);

  // Step 2: Login with registered credentials
  const loginResponse = await request(app)
    .post('/api/login')
    .send({
      username: userData.username,
      password: userData.password,
      role: 'user'
    })
    .expect(200);

  // Step 3: Access protected resource
  const profileResponse = await request(app)
    .get('/api/profile')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(200);

  expect(profileResponse.body.fullName).toBe(userData.fullName);
});
```

### 3. White Box Testing

White box tests focus on testing internal logic, code paths, and implementation details.

#### Component White Box Tests

**Location**: `src/components/__tests__/`

**Example**: `QuizGame.whitebox.test.tsx`

```typescript
describe('QuizGame Component - White Box Tests', () => {
  it('should update currentQuestion state correctly', async () => {
    const user = userEvent.setup();
    render(<TestWrapper><QuizGame /></TestWrapper>);

    // Verify initial state
    expect(screen.getByText('Question 1/3')).toBeInTheDocument();
    
    // Answer first question
    await user.click(screen.getByText('Greasy Pizza Box'));
    
    // Verify state update
    await waitFor(() => {
      expect(screen.getByText('Question 2/3')).toBeInTheDocument();
    });
  });
});
```

**Key Features**:
- Tests internal state management
- Tests conditional logic paths
- Tests edge cases
- Tests performance optimizations
- Tests data structure handling

#### Service White Box Tests

**Location**: `src/services/__tests__/`

**Example**: `api.whitebox.test.ts`

```typescript
describe('API Service - White Box Tests', () => {
  it('should execute console.log before API call', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockResponse = { data: { message: 'Success' } };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    await rewardAPI.redeemReward('reward123');

    // Verify internal execution order
    expect(consoleSpy).toHaveBeenCalledWith('Attempting to redeem reward with ID:', 'reward123');
    expect(consoleSpy).toHaveBeenCalledBefore(mockedAxios.post as jest.Mock);
  });
});
```

**Key Features**:
- Tests internal execution paths
- Tests parameter construction
- Tests error propagation
- Tests data flow
- Tests performance considerations

## Running Tests

### Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only end-to-end tests
npm run test:e2e
```

### Test Categories

1. **Unit Tests**: `src/**/__tests__/*.test.{ts,tsx}`
2. **Integration Tests**: `tests/integration/*.test.js`
3. **White Box Tests**: `src/**/__tests__/*.whitebox.test.{ts,tsx}`

## Test Coverage

### Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- HTML report: `coverage/lcov-report/index.html`
- LCOV report: `coverage/lcov.info`
- Text summary in terminal

## Best Practices

### 1. Test Structure

```typescript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### 2. Test Naming

- Use descriptive test names
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests using `describe` blocks

### 3. Test Data

- Use realistic test data
- Create reusable test fixtures
- Mock external dependencies

### 4. Assertions

- Use specific assertions
- Test one thing per test
- Use appropriate matchers

### 5. Cleanup

- Clean up after each test
- Reset mocks between tests
- Remove test data

## Mocking Strategies

### 1. API Mocking

```typescript
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.post.mockResolvedValueOnce(mockResponse);
```

### 2. LocalStorage Mocking

```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### 3. Component Mocking

```typescript
jest.mock('../components/SomeComponent', () => {
  return function MockedComponent() {
    return <div data-testid="mocked-component">Mocked</div>;
  };
});
```

## Debugging Tests

### 1. Debug Mode

```bash
npm test -- --verbose
```

### 2. Single Test

```bash
npm test -- --testNamePattern="specific test name"
```

### 3. Test File

```bash
npm test -- src/components/__tests__/QuizGame.test.tsx
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v1
```

## Troubleshooting

### Common Issues

1. **Test Timeout**: Increase timeout in Jest config
2. **Mock Issues**: Ensure mocks are properly reset
3. **Async Issues**: Use proper async/await patterns
4. **Coverage Issues**: Check test file patterns

### Debug Commands

```bash
# Debug specific test
npm test -- --testNamePattern="test name" --verbose

# Debug with coverage
npm test -- --coverage --verbose

# Debug specific file
npm test -- src/path/to/test.test.tsx --verbose
```

## Conclusion

This testing setup provides comprehensive coverage for the GreenQuest application, ensuring reliability, maintainability, and quality. The combination of unit tests, black box tests, and white box tests provides thorough validation of both external behavior and internal implementation.



