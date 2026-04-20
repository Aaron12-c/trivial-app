import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionCard from './components/QuestionCard';
import ResultScreen from './components/ResultScreen';
import { fetchQuestions } from './data/Question';
import type { Question } from './data/Question';

interface QuizResult {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
}

function App() {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [error, setError] = useState<string | null>(null);

  
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
          setQuizCompleted(false);
        }
      } catch (err) {
        console.error('Failed to load saved quiz:', err);
      }
    }
  }, []);

  
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

  useEffect(() => {
    const handlePopState = () => {
      if (quizStarted && !quizCompleted) {
        if (currentQuestionIndex > 0) {
          // Go to previous question
          setCurrentQuestionIndex((prev) => prev - 1);
        } else if (currentQuestionIndex === 0) {
          
          resetQuiz();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

  
    if (quizStarted && !quizCompleted) {
      window.history.pushState(null, '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quizStarted, quizCompleted, currentQuestionIndex]);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizStarted && !quizCompleted) {
        
        if (e.key === 'ArrowLeft') {
          if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
          }
        }
        
        if (e.key === 'ArrowRight' && currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          window.history.pushState(null, '');
        }
      
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
    setQuizCompleted(false);

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

      
        localStorage.setItem(
          'quizState',
          JSON.stringify({
            questions: fetchedQuestions,
            userAnswers: initialAnswers,
            currentQuestionIndex: 0,
          })
        );

      
        window.history.pushState(null, '');
      } else {
        setError('No questions available. Please try again.');
      }
    } catch (err) {
      console.error('Failed to fetch questions - Full error:', err);

      
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
      
      window.history.pushState(null, '');
    } else {
  
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    localStorage.removeItem('quizState');
    setQuizCompleted(true);
    setQuizStarted(false);
  };

  
  const handleTryAgain = () => {
    resetQuiz(); 
  };

  
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
            onPlayAgain={handleTryAgain}  // CHANGED: Now calls handleTryAgain instead of handlePlayAgain
          />
        </main>
      </div>
    );
  }

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