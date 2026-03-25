import { useState } from 'react';
import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionCard from './components/QuestionCard';
import { fetchQuestions } from './data/Question';

interface Question {
  id: number;
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers: string[];
}

function App() {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleBegin = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedQuestions = await fetchQuestions();

      if (fetchedQuestions && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setUserAnswers(new Array(fetchedQuestions.length).fill(null));
        setQuizStarted(true);
      } else {
        setError('No questions available. Please try again.');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
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
    } else {
      alert('Quiz completed! Check console for answers.');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="quizMain">
          <div className="loading-container">
            <h2>Loading questions...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <main className="quizMain">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={handleBegin}>Try Again</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="quizMain">
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
          <div>No questions available. Please try again.</div>
        )}
      </main>
    </div>
  );
}

export default App;
