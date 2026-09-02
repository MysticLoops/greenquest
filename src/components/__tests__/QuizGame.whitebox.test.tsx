import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import QuizGame from '../../components/QuizGame';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('QuizGame Component - White Box Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Internal State Management', () => {
    it('should initialize with correct default state values', () => {
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Test internal state through UI
      expect(screen.getByText('Question 1/3')).toBeInTheDocument();
      expect(screen.queryByText('You scored')).not.toBeInTheDocument();
    });

    it('should update currentQuestion state correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getByText('Question 1/3')).toBeInTheDocument();
      
      // Answer first question
      await user.click(screen.getByText('Greasy Pizza Box'));
      
      // Verify state update
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
        expect(screen.queryByText('Question 1/3')).not.toBeInTheDocument();
      });
    });

    it('should update score state correctly for correct answers', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer all questions correctly to test score state
      await user.click(screen.getByText('Greasy Pizza Box')); // Correct
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle')); // Correct
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years')); // Correct
      
      // Verify final score state
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
        expect(screen.getByText('Total: +15 Points')).toBeInTheDocument();
      });
    });

    it('should update score state correctly for mixed answers', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer with mix of correct and incorrect
      await user.click(screen.getByText('Plastic Bottle')); // Incorrect
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle')); // Correct
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('10-20 years')); // Incorrect
      
      // Verify score state reflects only correct answers
      await waitFor(() => {
        expect(screen.getByText('You scored 1 out of 3!')).toBeInTheDocument();
        expect(screen.getByText('Total: +5 Points')).toBeInTheDocument();
      });
    });

    it('should update showScore state when quiz is completed', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Complete the quiz
      await user.click(screen.getByText('Greasy Pizza Box'));
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle'));
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years'));
      
      // Verify showScore state is true
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
        expect(screen.queryByText('Question 3/3')).not.toBeInTheDocument();
      });
    });
  });

  describe('Internal Logic Flow', () => {
    it('should handle answer click logic correctly - correct answer path', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Test the internal logic flow for correct answer
      const correctAnswer = screen.getByText('Greasy Pizza Box');
      await user.click(correctAnswer);

      // Verify the logic path: score increment + question progression
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
      });
    });

    it('should handle answer click logic correctly - incorrect answer path', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Test the internal logic flow for incorrect answer
      const incorrectAnswer = screen.getByText('Plastic Bottle');
      await user.click(incorrectAnswer);

      // Verify the logic path: no score increment + question progression
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
      });
    });

    it('should handle quiz completion logic correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer first two questions
      await user.click(screen.getByText('Greasy Pizza Box'));
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle'));
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      // Answer last question - should trigger completion logic
      await user.click(screen.getByText('Over 450 years'));
      
      // Verify completion logic: showScore = true, display final score
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
        expect(screen.getByText('Total: +15 Points')).toBeInTheDocument();
        expect(screen.getByText('Play Again')).toBeInTheDocument();
      });
    });

    it('should handle restart logic correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Complete quiz first
      await user.click(screen.getByText('Greasy Pizza Box'));
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle'));
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years'));
      
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
      });

      // Test restart logic
      await user.click(screen.getByText('Play Again'));

      // Verify restart logic: reset all state variables
      await waitFor(() => {
        expect(screen.getByText('Question 1/3')).toBeInTheDocument();
        expect(screen.queryByText('You scored')).not.toBeInTheDocument();
        expect(screen.queryByText('Play Again')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle rapid consecutive clicks on same answer', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      const answer = screen.getByText('Greasy Pizza Box');
      
      // Rapidly click the same answer multiple times
      await user.click(answer);
      await user.click(answer);
      await user.click(answer);

      // Should only process the first click
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
      });
    });

    it('should handle rapid clicks on different answers', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Rapidly click different answers
      await user.click(screen.getByText('Plastic Bottle'));
      await user.click(screen.getByText('Greasy Pizza Box'));
      await user.click(screen.getByText('Aluminum Can'));

      // Should only process the first click
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
      });
    });

    it('should handle quiz with all incorrect answers', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer all questions incorrectly
      await user.click(screen.getByText('Plastic Bottle')); // Incorrect
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Read, Review, Repeat')); // Incorrect
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('10-20 years')); // Incorrect
      
      // Verify zero score handling
      await waitFor(() => {
        expect(screen.getByText('You scored 0 out of 3!')).toBeInTheDocument();
        expect(screen.getByText('Total: +0 Points')).toBeInTheDocument();
      });
    });

    it('should handle quiz with all correct answers', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer all questions correctly
      await user.click(screen.getByText('Greasy Pizza Box')); // Correct
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle')); // Correct
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years')); // Correct
      
      // Verify perfect score handling
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
        expect(screen.getByText('Total: +15 Points')).toBeInTheDocument();
      });
    });

    it('should handle restart multiple times', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Complete and restart multiple times
      for (let i = 0; i < 3; i++) {
        // Complete quiz
        await user.click(screen.getByText('Greasy Pizza Box'));
        await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
        
        await user.click(screen.getByText('Reduce, Reuse, Recycle'));
        await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
        
        await user.click(screen.getByText('Over 450 years'));
        
        await waitFor(() => {
          expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
        });

        // Restart
        await user.click(screen.getByText('Play Again'));
        
        await waitFor(() => {
          expect(screen.getByText('Question 1/3')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Internal Data Structures', () => {
    it('should correctly access questions array', () => {
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Verify all questions are accessible through UI
      expect(screen.getByText('Which of these items is NOT recyclable?')).toBeInTheDocument();
      
      // Answer first question to see second
      fireEvent.click(screen.getByText('Greasy Pizza Box'));
      
      // Verify second question is accessible
      setTimeout(() => {
        expect(screen.getByText('What does the "3 R\'s" of waste management stand for?')).toBeInTheDocument();
      }, 100);
    });

    it('should correctly access answer options for each question', () => {
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Verify first question options
      expect(screen.getByText('Plastic Bottle')).toBeInTheDocument();
      expect(screen.getByText('Greasy Pizza Box')).toBeInTheDocument();
      expect(screen.getByText('Aluminum Can')).toBeInTheDocument();
      expect(screen.getByText('Newspaper')).toBeInTheDocument();
    });

    it('should correctly identify correct answers internally', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Test that correct answers increment score
      await user.click(screen.getByText('Greasy Pizza Box')); // Correct
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle')); // Correct
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years')); // Correct
      
      // Verify all correct answers were identified
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <QuizGame />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Should only render once initially
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle state updates efficiently', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Multiple rapid state changes should be handled efficiently
      const startTime = performance.now();
      
      await user.click(screen.getByText('Greasy Pizza Box'));
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle'));
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years'));
      
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 1 second for UI updates)
      expect(duration).toBeLessThan(1000);
    });
  });
});



