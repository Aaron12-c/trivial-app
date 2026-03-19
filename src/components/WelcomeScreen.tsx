import type React from 'react';
import welcomeImage from '../assets/image.svg';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  onBegin?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin }) => {
  return (
    <div className={styles.welcomeScreen}>
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeImageContainer}>
          <img src={welcomeImage} alt="Trivia App Logo" className={styles.welcomeImage} />
        </div>

        <div className={styles.welcomeDivider}></div>

        <h2 className={styles.welcomeSubtitle}>Welcome to the Trivia Challenge</h2>

        <p className={styles.welcomeText}>You will be presented with 10 True or False questions</p>

        <p className={styles.welcomeQuestion}>Can you score 100%?</p>

        <button className={styles.welcomeButton} onClick={onBegin}>
          BEGIN
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
