import type React from 'react';
import styles from './ResultScreen.module.css';  // ← ADD THIS IMPORT

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  results: Array<{
    question: string;
    userAnswer: string;
    isCorrect: boolean;
  }>;
  onPlayAgain: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  totalQuestions,
  results,
  onPlayAgain,
}) => {
  // Calculate percentage (now it's being used in the JSX below)
  const percentage = Math.round((score / totalQuestions) * 100);

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className={styles.resultScreen}>
      <div className={styles.resultContainer}>
        <div className={styles.resultHeader}>
          <h1 className={styles.resultTitle}>You Scored</h1>
        </div>

        {/* Percentage is now being used - fixes the unused variable warning */}
        <div className={styles.percentageContainer}>
          <p className={styles.percentageText}>{percentage}% Correct</p>
        </div>

        <div className={styles.scoreDisplay}>
          <span className={styles.scoreNumber}>{score}</span>
          <span className={styles.scoreTotal}>/{totalQuestions}</span>
          <span className={styles.scoreEmoji} aria-hidden="true">🏅</span>
        </div>

        <div className={styles.answersList}>
          {results.map((result, index) => (
            <div
              key={index}
              className={`${styles.answerItem} ${result.isCorrect ? styles.correct : styles.incorrect}`}
            >
              <p className={styles.answerQuestion}>{decodeHtml(result.question)}</p>

              <div className={styles.answerFooter}>
                <div
                  className={`${styles.answerText} ${result.isCorrect ? styles.correct : styles.incorrect}`}
                >
                  <span className={styles.answerEmoji} aria-hidden="true">
                    {result.isCorrect ? '✅' : '❌'}
                  </span>
                  Your Answer: {result.userAnswer || 'Not answered'}
                </div>

                <div
                  className={`${styles.answerStatus} ${result.isCorrect ? styles.statusCorrect : styles.statusIncorrect}`}
                >
                  {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.playAgainBtn} onClick={onPlayAgain}>
          <span className={styles.restartIcon} aria-hidden="true">↻</span>
          TRY AGAIN
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;