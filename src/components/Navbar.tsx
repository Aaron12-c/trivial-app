import type React from 'react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <a href="/" className={styles.logo}>
          TrivialApp
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
