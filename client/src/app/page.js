import Link from "next/link";
import "../styles/landing-page.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <h1 className="landing-title">ClickClack</h1>
      <p className="landing-description">Improve your typing speed and accuracy with real-time tests.</p>
      <div className="landing-buttons">
        <Link href="/auth/login">
          <button>Login</button>
        </Link>
        <Link href="/auth/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
}
