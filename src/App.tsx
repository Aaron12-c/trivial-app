import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionCard from './components/QuestionCard';
import ResultScreen from './components/ResultScreen'; // ADD THIS IMPORT
import { fetchQuestions } from './data/Question';
import type { Question } from './data/Question';

interface QuizResult {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
}

function App() {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false); // ADD THIS
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load saved quiz state from localStorage on app start
  useEffect(() => {
    const savedQuiz = localStorage.getItem('quizState');
    if (savedQuiz) {
      try {
        const {
          questions: savedQuestions,
          userAnswers: savedAnswers,
          currentQuestionIndex: savedIndex,
        } = JSON.parse(savedQuiz);
        if (savedQuestions && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
          setUserAnswers(savedAnswers);
          setCurrentQuestionIndex(savedIndex);
          setQuizStarted(true);
          setQuizCompleted(false); // Ensure quiz is not marked as completed
        }
      } catch (err) {
        console.error('Failed to load saved quiz:', err);
      }
    }
  }, []);

  // Save quiz state to localStorage whenever it changes
  useEffect(() => {
    if (quizStarted && !quizCompleted && questions.length > 0) {
      localStorage.setItem(
        'quizState',
        JSON.stringify({
          questions,
          userAnswers,
          currentQuestionIndex,
        })
      );
    }
  }, [quizStarted, quizCompleted, questions, userAnswers, currentQuestionIndex]);

  // Handle browser back button - can go back to welcome page
  useEffect(() => {
    const handlePopState = () => {
      if (quizStarted && !quizCompleted) {
        if (currentQuestionIndex > 0) {
          // Go to previous question
          setCurrentQuestionIndex((prev) => prev - 1);
        } else if (currentQuestionIndex === 0) {
          // On first question, going back returns to welcome screen
          resetQuiz();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Push initial state to history so back button works
    if (quizStarted && !quizCompleted) {
      window.history.pushState(null, '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quizStarted, quizCompleted, currentQuestionIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizStarted && !quizCompleted) {
        // Left arrow key - go back
        if (e.key === 'ArrowLeft') {
          if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
          }
        }
        // Right arrow key - go forward (continue)
        if (e.key === 'ArrowRight' && currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          window.history.pushState(null, '');
        }
        // Escape key - exit quiz and return to welcome screen
        if (e.key === 'Escape') {
          resetQuiz();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [quizStarted, quizCompleted, currentQuestionIndex, questions.length]);

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    localStorage.removeItem('quizState');
  };

  const handleBegin = async () => {
    setError(null);
    setQuizCompleted(false); // Reset completed state

    try {
      console.log('Starting to fetch questions...');
      const fetchedQuestions = await fetchQuestions();
      console.log('Questions fetched successfully:', fetchedQuestions.length);

      if (fetchedQuestions && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        const initialAnswers = new Array(fetchedQuestions.length).fill(null);
        setUserAnswers(initialAnswers);
        setCurrentQuestionIndex(0);
        setQuizStarted(true);

        // Save to localStorage
        localStorage.setItem(
          'quizState',
          JSON.stringify({
            questions: fetchedQuestions,
            userAnswers: initialAnswers,
            currentQuestionIndex: 0,
          })
        );

        // Push to history for back button support
        window.history.pushState(null, '');
      } else {
        setError('No questions available. Please try again.');
      }
    } catch (err) {
      console.error('Failed to fetch questions - Full error:', err);

      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Network error: Please check your internet connection and try again.');
        } else if (err.message.includes('HTTP error')) {
          setError(`Server error: ${err.message}. Please try again later.`);
        } else if (err.message.includes('timeout')) {
          setError('Request timed out. Please check your connection and try again.');
        } else if (err.message.includes('response_code')) {
          setError('API error: Could not retrieve questions. Please try again.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Failed to load questions. Please try again.');
      }
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleContinue = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Push to history for back button support when moving forward
      window.history.pushState(null, '');
    } else {
      // Quiz completed - show results
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    localStorage.removeItem('quizState');
    setQuizCompleted(true);
    setQuizStarted(false);
  };

  const handlePlayAgain = () => {
    resetQuiz();
    handleBegin(); // Start a new quiz
  };

  // Calculate results for the ResultScreen
  const calculateResults = (): QuizResult[] => {
    return questions.map((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      return {
        question: question.question,
        userAnswer: userAnswer || '',
        isCorrect: isCorrect,
      };
    });
  };

  const calculateScore = (): number => {
    return questions.filter((question, index) => userAnswers[index] === question.correctAnswer)
      .length;
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Show error screen
  if (error) {
    return (
      <div>
        <Navbar />
        <main className="app-main">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={handleBegin} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show results screen
  if (quizCompleted && questions.length > 0) {
    const results = calculateResults();
    const score = calculateScore();

    return (
      <div>
        <Navbar />
        <main className="app-main">
          <ResultScreen
            score={score}
            totalQuestions={questions.length}
            results={results}
            onPlayAgain={handlePlayAgain}
          />
        </main>
      </div>
    );
  }

  // Main app render
  return (
    <div>
      <Navbar />
      <main className="app-main">
        {!quizStarted ? (
          <WelcomeScreen onBegin={handleBegin} />
        ) : questions.length > 0 && currentQuestion ? (
          <QuestionCard
            question={currentQuestion.question}
            category={currentQuestion.category}
            currentNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            selectedAnswer={userAnswers[currentQuestionIndex]}
            onContinue={handleContinue}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
          />
        ) : (
          <div className="error-container">
            <p>Loading questions... Please wait.</p>
            {questions.length === 0 && (
              <button onClick={handleBegin} className="retry-btn">
                Try Again
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
