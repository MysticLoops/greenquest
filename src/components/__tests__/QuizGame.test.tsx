import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import QuizGame from '../QuizGame';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('QuizGame Component - Unit Tests', () => {
  beforeEach(() => {
    // Clear any previous state
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the first question correctly', () => {
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      expect(screen.getByText('Question 1/3')).toBeInTheDocument();
      expect(screen.getByText('Which of these items is NOT recyclable?')).toBeInTheDocument();
      expect(screen.getByText('Plastic Bottle')).toBeInTheDocument();
      expect(screen.getByText('Greasy Pizza Box')).toBeInTheDocument();
      expect(screen.getByText('Aluminum Can')).toBeInTheDocument();
      expect(screen.getByText('Newspaper')).toBeInTheDocument();
    });

    it('should display correct question number', () => {
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      expect(screen.getByText('Question 1/3')).toBeInTheDocument();
    });
  });

  describe('Answer Selection Logic', () => {
    it('should increment score when correct answer is selected', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Click the correct answer (Greasy Pizza Box)
      const correctAnswer = screen.getByText('Greasy Pizza Box');
      await user.click(correctAnswer);

      // Should move to next question
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
      });
    });

    it('should not increment score when incorrect answer is selected', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Click an incorrect answer (Plastic Bottle)
      const incorrectAnswer = screen.getByText('Plastic Bottle');
      await user.click(incorrectAnswer);

      // Should move to next question
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
      });
    });

    it('should progress through all questions', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer all questions (mix of correct and incorrect)
      await user.click(screen.getByText('Greasy Pizza Box')); // Correct
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle')); // Correct
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years')); // Correct
      
      // Should show final score
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
      });
    });
  });

  describe('Score Calculation', () => {
    it('should display correct final score', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer all questions correctly
      await user.click(screen.getByText('Greasy Pizza Box'));
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle'));
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Over 450 years'));
      
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
        expect(screen.getByText('Total: +15 Points')).toBeInTheDocument();
      });
    });

    it('should calculate points correctly (5 points per correct answer)', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Answer 2 questions correctly
      await user.click(screen.getByText('Greasy Pizza Box')); // Correct
      await waitFor(() => expect(screen.getByText('Question 2/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('Reduce, Reuse, Recycle')); // Correct
      await waitFor(() => expect(screen.getByText('Question 3/3')).toBeInTheDocument());
      
      await user.click(screen.getByText('10-20 years')); // Incorrect
      
      await waitFor(() => {
        expect(screen.getByText('You scored 2 out of 3!')).toBeInTheDocument();
        expect(screen.getByText('Total: +10 Points')).toBeInTheDocument();
      });
    });
  });

  describe('Quiz Restart Functionality', () => {
    it('should restart quiz when "Play Again" is clicked', async () => {
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
      
      await waitFor(() => {
        expect(screen.getByText('You scored 3 out of 3!')).toBeInTheDocument();
      });

      // Click Play Again
      await user.click(screen.getByText('Play Again'));

      // Should restart to first question
      await waitFor(() => {
        expect(screen.getByText('Question 1/3')).toBeInTheDocument();
        expect(screen.getByText('Which of these items is NOT recyclable?')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking on answers', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <QuizGame />
        </TestWrapper>
      );

      // Rapidly click multiple answers
      const answer1 = screen.getByText('Plastic Bottle');
      const answer2 = screen.getByText('Greasy Pizza Box');
      
      await user.click(answer1);
      await user.click(answer2);

      // Should only process the first click
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
      });
    });

    it('should maintain state correctly during quiz progression', async () => {
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
      
      // Verify state progression
      await waitFor(() => {
        expect(screen.getByText('Question 2/3')).toBeInTheDocument();
        expect(screen.queryByText('Question 1/3')).not.toBeInTheDocument();
      });
    });
  });
});


