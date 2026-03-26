import type React from 'react';
import { useState } from 'react';
import styles from './QuestionCard.module.css';
import { decodeHtml, formatCategory } from '../data/Question';

interface QuestionCardProps {
  question: string;
  category: string;
  currentNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  onContinue: () => void;
  isLastQuestion: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  category,
  currentNumber,
  totalQuestions,
  onAnswer,
  selectedAnswer,
  onContinue,
  isLastQuestion,
}) => {
  const [showValidation, setShowValidation] = useState<boolean>(false);

  const handleContinueClick = (): void => {
    if (!selectedAnswer) {
      setShowValidation(true);
    } else {
      setShowValidation(false);
      onContinue();
    }
  };

  const handleAnswerClick = (answer: string): void => {
    onAnswer(answer);
    setShowValidation(false);
  };

  return (
    <div className={styles.quizContainer}>
      <div className={styles.progressIndicator}>
        {currentNumber}/{totalQuestions}{' '}
        <span className={styles.categoryBracket}>({formatCategory(category)})</span>
      </div>

      <div className={styles.questionContainer}>
        <h2 className={styles.quizQuestion}>{decodeHtml(question)}</h2>
      </div>

      <div className={styles.answersContainer}>
        <button
          className={`${styles.answerBtn} ${styles.trueBtn} ${selectedAnswer === 'True' ? styles.selected : ''}`}
          onClick={() => handleAnswerClick('True')}
          aria-pressed={selectedAnswer === 'True'}
        >
          <span className={styles.btnIcon}>✔</span> True
        </button>
        <button
          className={`${styles.answerBtn} ${styles.falseBtn} ${selectedAnswer === 'False' ? styles.selected : ''}`}
          onClick={() => handleAnswerClick('False')}
          aria-pressed={selectedAnswer === 'False'}
        >
          <span className={styles.btnIcon}>✕</span> False
        </button>
      </div>

      {showValidation && (
        <div className={styles.validationMessage}>Please, answer this question</div>
      )}

      <div className={styles.continueSection}>
        <button className={styles.continueBtn} onClick={handleContinueClick}>
          {isLastQuestion ? 'SUBMIT' : 'CONTINUE'}
          <span className={styles.arrowCircle}>
            <span className={styles.arrowIcon}>→</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
