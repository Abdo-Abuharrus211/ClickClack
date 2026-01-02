"use client";

import { SERVER_BASE_URL } from "@/utils/api";
import "../../../styles/signup-page.css";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [display_name, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    display_name: false,
    email: false,
    password: false,
  });

  const handleDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
    if (fieldErrors.display_name) {
      setFieldErrors((prev) => ({ ...prev, display_name: false }));
      setError(null);
    }
  };

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
    const trimmedDisplayName = display_name.trim();

    // Reset field errors
    setFieldErrors({ display_name: false, email: false, password: false });

    if (!trimmedDisplayName) {
      hasError = true;
      errorMessage = "Display name is required.";
      setFieldErrors((prev) => ({ ...prev, display_name: true }));
    }

    if (!trimmedEmail) {
      hasError = true;
      errorMessage = errorMessage || "Email is required.";
      setFieldErrors((prev) => ({ ...prev, email: true }));
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        hasError = true;
        errorMessage = errorMessage || "Invalid email format.";
        setFieldErrors((prev) => ({ ...prev, email: true }));
      }
    }

    if (!password) {
      hasError = true;
      errorMessage = errorMessage || "Password is required.";
      setFieldErrors((prev) => ({ ...prev, password: true }));
    } else {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        hasError = true;
        errorMessage = errorMessage || "Password must be at least 8 characters long, and contain letters and numbers.";
        setFieldErrors((prev) => ({ ...prev, password: true }));
      }
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
      display_name,
      email,
      password,
    };

    try {
      const response = await fetch("https://api.clickclack.aabuharrus.dev/api/v1/auth/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include"
      });

      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to sign up.");
      }

      const data = await response.json();
      console.log("Signup successful:", data);
      window.location.href = "/home"

    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="signup-container">
      <h1 className="signup-title">Sign Up</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Display Name"
          className={`signup-input ${fieldErrors.display_name ? "input-error" : ""}`}
          value={display_name}
          onChange={handleDisplayNameChange}
        />
        <input
          type="email"
          placeholder="Email"
          className={`signup-input ${fieldErrors.email ? "input-error" : ""}`}
          value={email}
          onChange={handleEmailChange}
        />
        <input
          type="password"
          placeholder="Password"
          className={`signup-input ${fieldErrors.password ? "input-error" : ""}`}
          value={password}
          onChange={handlePasswordChange}
        />

        <button type="submit" className="signup-button" disabled={loading}>{loading ? "Signing up..." : "Sign Up"} </button>
      </form>
      {error && <p className="signup-error" style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <p className="signup-login-text">
        Already have an account? <Link href="/auth/login" className="signup-login-link">Login here</Link>
      </p>
    </div>
  );
}
