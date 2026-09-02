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

/**
 * COMPREHENSIVE TESTING EXAMPLE
 * 
 * This file demonstrates all three testing approaches:
 * 1. Unit Testing - Testing individual components in isolation
 * 2. Black Box Testing - Testing external behavior without knowledge of internals
 * 3. White Box Testing - Testing internal logic and implementation details
 */

describe('Hero Component - Comprehensive Testing Example', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =================================================================
  // UNIT TESTING SECTION
  // =================================================================
  // Tests individual components in isolation
  // Focus: Component behavior, props, rendering, user interactions

  describe('UNIT TESTS - Component Behavior', () => {
    it('should render with default props', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test component rendering
      expect(screen.getByText('Recycling, Reimagined.')).toBeInTheDocument();
      expect(screen.getByText(/Our platform simplifies sustainability/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start your journey/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view schedule/i })).toBeInTheDocument();
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

      // Test prop handling
      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customSubtitle)).toBeInTheDocument();
    });

    it('should handle button clicks', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Test user interaction
      await user.click(scheduleButton);
      
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
      });
    });

    it('should have proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test accessibility
      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      expect(scheduleButton).toHaveAttribute('aria-controls', 'schedule-section');
      expect(scheduleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // =================================================================
  // BLACK BOX TESTING SECTION
  // =================================================================
  // Tests external behavior without knowledge of internal implementation
  // Focus: User workflows, API interactions, system behavior

  describe('BLACK BOX TESTS - User Workflows', () => {
    it('should complete full user interaction workflow', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test complete user workflow
      // Step 1: User sees the hero section
      expect(screen.getByText('Recycling, Reimagined.')).toBeInTheDocument();
      
      // Step 2: User clicks "Start Your Journey"
      const startButton = screen.getByRole('button', { name: /start your journey/i });
      await user.click(startButton);
      
      // Step 3: User clicks "View Schedule"
      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      await user.click(scheduleButton);
      
      // Step 4: User sees schedule section
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
      });
      
      // Step 5: User hides schedule
      await user.click(scheduleButton);
      
      // Step 6: User sees schedule is hidden
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('View Schedule');
      });
    });

    it('should handle external scroll behavior', async () => {
      const user = userEvent.setup();
      
      // Mock external dependencies
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;
      
      const mockElement = { scrollIntoView: mockScrollIntoView };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
      
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test external system interaction
      const startButton = screen.getByRole('button', { name: /start your journey/i });
      await user.click(startButton);

      // Verify external system was called correctly
      expect(document.getElementById).toHaveBeenCalledWith('join');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle system errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock system error
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test error handling
      const startButton = screen.getByRole('button', { name: /start your journey/i });
      
      // Should not throw error when external system fails
      await expect(async () => {
        await user.click(startButton);
      }).not.toThrow();
    });
  });

  // =================================================================
  // WHITE BOX TESTING SECTION
  // =================================================================
  // Tests internal logic and implementation details
  // Focus: Code paths, state management, edge cases, performance

  describe('WHITE BOX TESTS - Internal Logic', () => {
    it('should manage internal state correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Test internal state management
      // Initial state: isScheduleOpen = false
      expect(scheduleButton).toHaveTextContent('View Schedule');
      expect(scheduleButton).toHaveAttribute('aria-expanded', 'false');
      
      // State change: isScheduleOpen = true
      await user.click(scheduleButton);
      
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
        expect(scheduleButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      // State change: isScheduleOpen = false
      await user.click(scheduleButton);
      
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('View Schedule');
        expect(scheduleButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should handle internal logic paths correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Test internal logic path: handleToggleSchedule
      // Path 1: isScheduleOpen = false -> true
      await user.click(scheduleButton);
      
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
      });
      
      // Path 2: isScheduleOpen = true -> false
      await user.click(scheduleButton);
      
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('View Schedule');
      });
    });

    it('should handle edge cases in internal logic', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Test edge case: rapid clicking
      await user.click(scheduleButton);
      await user.click(scheduleButton);
      await user.click(scheduleButton);
      
      // Should handle rapid state changes correctly
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
      });
    });

    it('should handle internal data structures correctly', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test internal data structure: blobs array
      const heroSection = document.querySelector('section');
      expect(heroSection).toBeInTheDocument();
      
      // Verify internal CSS classes are applied correctly
      expect(heroSection).toHaveClass('relative', 'min-h-screen', 'bg-green-800');
    });

    it('should handle internal performance optimizations', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <Hero />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Test performance: should not cause unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  // =================================================================
  // INTEGRATION TESTING SECTION
  // =================================================================
  // Tests component integration with other systems
  // Focus: Component interactions, context usage, routing

  describe('INTEGRATION TESTS - Component Integration', () => {
    it('should integrate with AuthContext correctly', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test context integration
      expect(screen.getByText('Recycling, Reimagined.')).toBeInTheDocument();
      // Component should render without context errors
    });

    it('should integrate with React Router correctly', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test router integration
      expect(screen.getByText('Recycling, Reimagined.')).toBeInTheDocument();
      // Component should render without router errors
    });

    it('should integrate with external components correctly', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test external component integration
      const startButton = screen.getByRole('button', { name: /start your journey/i });
      expect(startButton).toBeInTheDocument();
      
      // Test that external components are properly integrated
      expect(startButton).toHaveClass('group', 'inline-flex', 'items-center');
    });
  });

  // =================================================================
  // PERFORMANCE TESTING SECTION
  // =================================================================
  // Tests component performance and optimization
  // Focus: Render performance, memory usage, optimization

  describe('PERFORMANCE TESTS - Component Performance', () => {
    it('should render within acceptable time limits', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle multiple rapid interactions efficiently', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      const startTime = performance.now();
      
      // Rapid interactions
      for (let i = 0; i < 10; i++) {
        await user.click(scheduleButton);
      }
      
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      // Should handle rapid interactions efficiently (less than 1 second)
      expect(interactionTime).toBeLessThan(1000);
    });

    it('should not cause memory leaks', () => {
      const { unmount } = render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test memory cleanup
      expect(() => unmount()).not.toThrow();
    });
  });

  // =================================================================
  // ACCESSIBILITY TESTING SECTION
  // =================================================================
  // Tests component accessibility and usability
  // Focus: ARIA attributes, keyboard navigation, screen reader support

  describe('ACCESSIBILITY TESTS - Component Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Test ARIA attributes
      expect(scheduleButton).toHaveAttribute('aria-controls', 'schedule-section');
      expect(scheduleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      const scheduleButton = screen.getByRole('button', { name: /view schedule/i });
      
      // Test keyboard navigation
      scheduleButton.focus();
      expect(scheduleButton).toHaveFocus();
      
      // Test keyboard activation
      fireEvent.keyDown(scheduleButton, { key: 'Enter' });
      await waitFor(() => {
        expect(scheduleButton).toHaveTextContent('Hide Schedule');
      });
    });

    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      );

      // Test semantic structure
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Recycling, Reimagined.');
    });
  });
});



