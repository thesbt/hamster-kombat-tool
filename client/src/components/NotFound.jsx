import React from "react";
import { Link } from "react-router-dom";
import styles from "./assets/NotFound.module.css";

function NotFound() {
  return (
    <div className={styles.notFound}>
      <h1>404</h1>
      <p>Page Not Found :(</p>
      <Link to="/" className={styles.homeLink}>
        Back to Homepage
      </Link>
    </div>
  );
}

export default NotFound;
