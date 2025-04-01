"use client";

import { SERVER_BASE_URL } from "@/utils/api";
import "../../../styles/login-page.css";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const userData = {
      email,
      password,
    };

    try {
      const response = await fetch(`${SERVER_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to sign up.");
      }

      const data = await response.json();
      console.log("Login successful:", data);
      window.location.href = "/home";

    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="login-button" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>

      <p className="login-signup-text">
        Don&apos;t have an account? <Link href="/auth/signup" className="login-signup-link">Sign up here</Link>
      </p>
    </div>
  );
}
