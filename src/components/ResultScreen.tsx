import React, { useEffect } from 'react';
import { decodeHtml } from '../data/Question';
import styles from './ResultScreen.module.css';

interface Result {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  results: Result[];
  onPlayAgain: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  totalQuestions,
  results,
  onPlayAgain,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className={styles.resultScreen}>
      <div className={styles.resultContainer}>
        <div className={styles.resultHeader}>
          <h1 className={styles.resultTitle}>You Scored</h1>
        </div>

        <div className={styles.scoreDisplay}>
          <span className={styles.scoreNumber}>{score}</span>
          <span className={styles.scoreTotal}>/{totalQuestions}</span>
          <span className={styles.scoreEmoji}>🏅</span>
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
                  <span className={styles.answerEmoji}>{result.isCorrect ? '✅' : '❌'}</span>
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
          <span className={styles.restartIcon}>↻</span>
          TRY AGAIN
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
