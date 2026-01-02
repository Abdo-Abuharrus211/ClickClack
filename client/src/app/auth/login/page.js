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
  const [fieldErrors, setFieldErrors] = useState({
    display_name: false,
    email: false,
    password: false,
  });


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: false }));
      setError(null);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: false }));
      setError(null);
    }
  };

  const validateInput = () => {
    let hasError = false;
    let errorMessage = "";

    const trimmedEmail = email.trim();

    // Reset field errors
    setFieldErrors({ email: false, password: false });

    if (!trimmedEmail) {
      hasError = true;
      errorMessage = "Email is required.";
      setFieldErrors((prev) => ({ ...prev, email: true }));
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        hasError = true;
        errorMessage = "Invalid email format.";
        setFieldErrors((prev) => ({ ...prev, email: true }));
      }
    }

    if (!password) {
      hasError = true;
      errorMessage = errorMessage || "Password is required.";
      setFieldErrors((prev) => ({ ...prev, password: true }));
    }

    if (hasError) {
      setError(errorMessage);
    }

    return !hasError;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    setLoading(true);
    setError(null);

    const userData = {
      email,
      password,
    };

    try {
      const response = await fetch("https://api.clickclack.aabuharrus.dev/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to log in.");
      }

      const data = await response.json();
      console.log("User's login info 😩", data);
      console.log("Redirecting to '/home'...");
      window.location.replace("/home")
      
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      // console.log("Paused redirecting to '/home'..")
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className={`login-input ${fieldErrors.email ? "input-error" : ""}`}
          value={email}
          onChange={handleEmailChange}
        />
        <input
          type="password"
          placeholder="Password"
          className={`login-input ${fieldErrors.password ? "input-error" : ""}`}
          value={password}
          onChange={handlePasswordChange}
        />
        <button type="submit" className="login-button" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      {error && <p className="login-error" style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <p className="login-signup-text">
        Don&apos;t have an account? <Link href="/auth/signup" className="login-signup-link">Sign up here</Link>
      </p>
    </div>
  );
}
