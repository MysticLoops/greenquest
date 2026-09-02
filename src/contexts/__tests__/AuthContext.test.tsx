import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { User, Admin } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test-token', { id: 'user123', fullName: 'Test User' } as User)}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with null user and token', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('should restore user and token from localStorage on mount', () => {
      const mockUser = { id: 'user123', fullName: 'Test User', phone: '1234567890' };
      const mockToken = 'stored-token';
      
      localStorageMock.getItem
        .mockReturnValueOnce(mockToken) // First call for token
        .mockReturnValueOnce(JSON.stringify(mockUser)); // Second call for user

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(localStorageMock.getItem).toHaveBeenCalledWith('greenquest_token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('greenquest_user');
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('invalid-json');

      // Should not throw error
      expect(() => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      }).not.toThrow();
    });
  });

  describe('Login Functionality', () => {
    it('should login user successfully', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      const mockUser = { id: 'user123', fullName: 'Test User' };

      act(() => {
        loginBtn.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    it('should save user and token to localStorage on login', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      const mockUser = { id: 'user123', fullName: 'Test User' };

      act(() => {
        loginBtn.click();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('greenquest_token', 'test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('greenquest_user', JSON.stringify(mockUser));
    });

    it('should handle admin user login', () => {
      const AdminTestComponent: React.FC = () => {
        const { login } = useAuth();
        
        return (
          <button 
            data-testid="admin-login-btn" 
            onClick={() => login('admin-token', { id: 'admin123', name: 'Admin User' } as Admin)}
          >
            Admin Login
          </button>
        );
      };

      render(
        <AuthProvider>
          <AdminTestComponent />
        </AuthProvider>
      );

      const adminLoginBtn = screen.getByTestId('admin-login-btn');
      const mockAdmin = { id: 'admin123', name: 'Admin User' };

      act(() => {
        adminLoginBtn.click();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('greenquest_token', 'admin-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('greenquest_user', JSON.stringify(mockAdmin));
    });
  });

  describe('Logout Functionality', () => {
    it('should logout user successfully', () => {
      // First login
      localStorageMock.getItem
        .mockReturnValueOnce('test-token')
        .mockReturnValueOnce(JSON.stringify({ id: 'user123', fullName: 'Test User' }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Verify logged in state
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');

      // Then logout
      const logoutBtn = screen.getByTestId('logout-btn');
      
      act(() => {
        logoutBtn.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('should clear localStorage on logout', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutBtn = screen.getByTestId('logout-btn');
      
      act(() => {
        logoutBtn.click();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('greenquest_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('greenquest_user');
    });
  });

  describe('Authentication State', () => {
    it('should correctly determine authentication status', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially not authenticated
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');

      // Login
      const loginBtn = screen.getByTestId('login-btn');
      act(() => {
        loginBtn.click();
      });

      // Should be authenticated
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');

      // Logout
      const logoutBtn = screen.getByTestId('logout-btn');
      act(() => {
        logoutBtn.click();
      });

      // Should not be authenticated
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('should be authenticated only when both token and user exist', () => {
      const PartialTestComponent: React.FC = () => {
        const { login, isAuthenticated } = useAuth();
        
        return (
          <div>
            <div data-testid="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <button 
              data-testid="partial-login-btn" 
              onClick={() => login('token-only', null as any)}
            >
              Partial Login
            </button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <PartialTestComponent />
        </AuthProvider>
      );

      const partialLoginBtn = screen.getByTestId('partial-login-btn');
      
      act(() => {
        partialLoginBtn.click();
      });

      // Should not be authenticated if user is null
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw error
      expect(() => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      }).not.toThrow();
    });
  });

  describe('Context Provider', () => {
    it('should provide all required context values', () => {
      const ContextTestComponent: React.FC = () => {
        const context = useAuth();
        
        return (
          <div>
            <div data-testid="has-user">{context.user !== undefined ? 'true' : 'false'}</div>
            <div data-testid="has-token">{context.token !== undefined ? 'true' : 'false'}</div>
            <div data-testid="has-login">{typeof context.login === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-logout">{typeof context.logout === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-isAuthenticated">{typeof context.isAuthenticated === 'boolean' ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <ContextTestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('has-user')).toHaveTextContent('true');
      expect(screen.getByTestId('has-token')).toHaveTextContent('true');
      expect(screen.getByTestId('has-login')).toHaveTextContent('true');
      expect(screen.getByTestId('has-logout')).toHaveTextContent('true');
      expect(screen.getByTestId('has-isAuthenticated')).toHaveTextContent('true');
    });
  });
});



