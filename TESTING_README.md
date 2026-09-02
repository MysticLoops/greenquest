# GreenQuest Testing Setup

## 🧪 Complete Testing Infrastructure

This repository includes a comprehensive testing setup covering **Unit Testing**, **Black Box Testing**, and **White Box Testing** for the GreenQuest application.

## 📋 What's Included

### ✅ Testing Infrastructure
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing
- **Supertest** - API endpoint testing
- **MSW** - API mocking
- **Coverage reporting** - Test coverage analysis

### ✅ Test Types Implemented

#### 1. Unit Tests
- **Components**: `src/components/__tests__/`
- **Services**: `src/services/__tests__/`
- **Contexts**: `src/contexts/__tests__/`

#### 2. Black Box Tests
- **API Endpoints**: `tests/integration/api-endpoints.test.js`
- **User Workflows**: Complete user journeys
- **System Integration**: External system interactions

#### 3. White Box Tests
- **Internal Logic**: `src/**/__tests__/*.whitebox.test.tsx`
- **State Management**: Internal state testing
- **Code Paths**: Conditional logic testing
- **Edge Cases**: Boundary condition testing

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📁 Test Structure

```
greenquest/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       ├── QuizGame.test.tsx           # Unit tests
│   │       ├── QuizGame.whitebox.test.tsx  # White box tests
│   │       ├── Hero.test.tsx               # Unit tests
│   │       ├── Hero.whitebox.test.tsx      # White box tests
│   │       └── Hero.comprehensive.test.tsx # All test types example
│   ├── services/
│   │   └── __tests__/
│   │       ├── api.test.ts                 # Unit tests
│   │       └── api.whitebox.test.ts        # White box tests
│   ├── contexts/
│   │   └── __tests__/
│   │       └── AuthContext.test.tsx        # Unit tests
│   └── setupTests.ts                       # Test setup
├── tests/
│   └── integration/
│       └── api-endpoints.test.js            # Black box tests
├── .github/
│   └── workflows/
│       └── ci-cd.yml                        # CI/CD pipeline
├── jest.config.js                           # Jest configuration
├── TESTING_GUIDE.md                         # Comprehensive guide
└── README.md                                # This file
```

## 🎯 Test Examples

### Unit Test Example
```typescript
describe('QuizGame Component - Unit Tests', () => {
  it('should render the first question correctly', () => {
    render(<TestWrapper><QuizGame /></TestWrapper>);
    
    expect(screen.getByText('Question 1/3')).toBeInTheDocument();
    expect(screen.getByText('Which of these items is NOT recyclable?')).toBeInTheDocument();
  });
});
```

### Black Box Test Example
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
  });
});
```

### White Box Test Example
```typescript
describe('QuizGame Component - White Box Tests', () => {
  it('should update currentQuestion state correctly', async () => {
    const user = userEvent.setup();
    render(<TestWrapper><QuizGame /></TestWrapper>);

    // Test internal state management
    expect(screen.getByText('Question 1/3')).toBeInTheDocument();
    
    await user.click(screen.getByText('Greasy Pizza Box'));
    
    await waitFor(() => {
      expect(screen.getByText('Question 2/3')).toBeInTheDocument();
    });
  });
});
```

## 📊 Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## 🔧 Configuration Files

- `jest.config.js` - Jest configuration
- `src/setupTests.ts` - Test setup and mocks
- `audit-ci.json` - Security audit configuration
- `lighthouserc.js` - Performance testing configuration

## 🚀 CI/CD Pipeline

The GitHub Actions workflow includes:
- **Testing**: Unit, integration, and E2E tests
- **Security**: Dependency audit and vulnerability scanning
- **Build**: Application build and artifact generation
- **Deployment**: Staging and production deployments
- **Performance**: Lighthouse CI performance testing

## 📚 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing guide
- **[CI/CD Pipeline](./.github/workflows/ci-cd.yml)** - Automated testing and deployment

## 🛠️ Development Workflow

1. **Write Tests**: Create tests for new features
2. **Run Tests**: `npm test` to verify functionality
3. **Check Coverage**: `npm run test:coverage` to ensure coverage
4. **Commit**: Tests must pass before committing
5. **CI/CD**: Automated testing on push/PR

## 🎉 Benefits

### ✅ Quality Assurance
- **Comprehensive Coverage**: All three testing approaches
- **Automated Testing**: CI/CD integration
- **Quality Gates**: Tests must pass before deployment

### ✅ Development Efficiency
- **Fast Feedback**: Quick test execution
- **Easy Debugging**: Detailed test output
- **Confident Refactoring**: Test safety net

### ✅ Maintainability
- **Documentation**: Comprehensive testing guide
- **Best Practices**: Established testing patterns
- **Scalability**: Easy to add new tests

## 🤝 Contributing

When adding new features:
1. Write unit tests for components/services
2. Add black box tests for user workflows
3. Include white box tests for complex logic
4. Ensure all tests pass
5. Maintain coverage goals

## 📞 Support

For testing questions or issues:
1. Check the [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Review existing test examples
3. Follow established patterns
4. Ask for help if needed

---

**Happy Testing! 🧪✨**



