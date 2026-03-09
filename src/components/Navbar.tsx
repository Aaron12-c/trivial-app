import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <a href="/" className={styles.logo}>
          TrivialApp
        </a>
      </div>
    </nav>
  );
}