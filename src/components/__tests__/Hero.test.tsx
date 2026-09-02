import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Hero from '../Hero';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Hero Component - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with default props', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      expect(screen.getByText('Recycling, Reimagined.')).toBeInTheDocument();
      expect(screen.getByText(/Our platform simplifies sustainability/)).toBeInTheDocument();
      expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
      expect(screen.getByText('View Schedule')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      const customTitle = 'Custom Title';
      const customSubtitle = 'Custom subtitle text';
      
      render(
        <TestWrapper>
          <Hero 
            title={customTitle}
            subtitle={customSubtitle}
            heroIconSize={200}
          />
        </TestWrapper>
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customSubtitle)).toBeInTheDocument();
    });

    it('should render all interactive elements', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /start your journey/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view schedule/i })).toBeInTheDocument();
    });
  });

  describe('Schedule Toggle Functionality', () => {
    it('should toggle schedule visibility when View Schedule button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Initially should show "View Schedule"
      expect(scheduleButton).toHaveTextContent('View Schedule');
      
      // Click to open schedule
      await user.click(scheduleButton);
      
      // Should change to "Hide Schedule"
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
      });
    });

    it('should toggle back to View Schedule when Hide Schedule is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Open schedule
      await user.click(scheduleButton);
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
      });
      
      // Close schedule
      await user.click(scheduleButton);
      
      // Should change back to "View Schedule"
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('View Schedule');
      });
    });

    it('should have proper ARIA attributes for accessibility', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Check initial ARIA attributes
      expect(scheduleButton).toHaveAttribute('aria-controls', 'schedule-section');
      expect(scheduleButton).toHaveAttribute('aria-expanded', 'false');
      
      // Click to open
      await user.click(scheduleButton);
      
      // Check updated ARIA attributes
      await waitFor(() => {
        expect(scheduleButton).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Start Your Journey Button', () => {
    it('should scroll to join section when clicked', async () => {
      const user = userEvent.setup();
      
      // Mock scrollIntoView
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;
      
      // Mock getElementById to return a mock element
      const mockElement = { scrollIntoView: mockScrollIntoView };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
      
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start your journey/i });
      await user.click(startButton);

      expect(document.getElementById).toHaveBeenCalledWith('join');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle case when join element is not found', async () => {
      const user = userEvent.setup();
      
      // Mock getElementById to return null
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start your journey/i });
      
      // Should not throw error when element is not found
      await expect(async () => {
        await user.click(startButton);
      }).not.toThrow();
    });
  });

  describe('Component State Management', () => {
    it('should maintain schedule state correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Initial state
      expect(scheduleButton).toHaveTextContent('View Schedule');
      
      // Toggle multiple times
      await user.click(scheduleButton);
      await waitFor(() => expect(scheduleButton).toHaveTextContent('Hide Schedule'));
      
      await user.click(scheduleButton);
      await waitFor(() => expect(scheduleButton).toHaveTextContent('View Schedule'));
      
      await user.click(scheduleButton);
      await waitFor(() => expect(scheduleButton).toHaveTextContent('Hide Schedule'));
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should apply correct CSS classes', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const heroSection = screen.getByRole('banner') || document.querySelector('section');
      expect(heroSection).toHaveClass('relative', 'min-h-screen', 'bg-green-800');
      
      const startButton = screen.getByRole('button', { name: /start your journey/i });
      expect(startButton).toHaveClass('group', 'inline-flex', 'items-center');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Check for proper heading structure
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Recycling, Reimagined.');
    });

    it('should have proper button roles and labels', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});


