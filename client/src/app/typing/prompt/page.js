"use client";

import Scoreboard from "@/app/partials/scoreboard";
import "../../../styles/prompt-page.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserProfile, SERVER_BASE_URL } from "@/utils/api";

export default function PromptPage() {
  const [difficulty, setDifficulty] = useState("easy");
  const [testDuration, setTestDuration] = useState("30");
  const [theme, setText] = useState("");
  const [themeError, setThemeError] = useState(null);
  const [apiTokens, setApiTokens] = useState(0);
  const [response, setResponse] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleThemeChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Clear error when resume type
    if (themeError) {
      setThemeError(null);
    }
    if (value.trim().length > 30) {
      setThemeError("Theme must be under 30 characters");
    }
  };

  const validateTheme = (value) => {
    if (value.trim().length > 30) {
      setThemeError("Theme must be under 30 characters");
      return false;
    }
    setThemeError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateTheme(theme)) {
      return
    }
    setLoading(true);
    setError(null);

    const requestData = {
      difficulty: difficulty,
      theme: theme,
    };

    try {
      const response = await fetch("https://api.clickclack.aabuharrus.dev/api/v1/ai/generate-test-prompt/", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prompt.");
      }

      const res = await response.json();
      // console.log("AI generated text:", res.data);
      setResponse(res.data)
      setApiTokens(prev => prev - 1)
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
    fetchPrevPrompts();
  };

  const fetchPrevPrompts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("https://api.clickclack.aabuharrus.dev/api/v1/users/get-previous-prompts/", {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch previous prompts.");
      }

      const res = await response.json();
      setPrevPrompts(res.data)
    } catch (error) {
      console.error("Error fetching previous prompts:", error);
      setError(error);
    } finally {
      setLoading(false)
    }
  }

  const deletePrompt = async (promptid) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${SERVER_BASE_URL}/tests/remove-prompt/`, {
        credentials: "include",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promptid })
      });

      if (!response.ok) {
        throw new Error("Failed to delete prompt.");
      }

      console.log("Received: ", response.message)

      setPrevPrompts((prev) => prev.filter((prompt) => prompt.promptid !== promptid));
    } catch (error) {
      console.error("Error deleting prompt:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // THIS IS IN HERE CUZ BREAK OTHERWISE - React moment
    const fetchTokens = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getUserProfile();
        const trials = response.tokenCount
        setApiTokens(trials)

      } catch (error) {
        console.log("Error fetching the user's trials", error);
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchTokens();
  }, [])

  useEffect(() => {
    fetchPrevPrompts();
  }, [])


  return (
    <>
      <div className="prompt-container">
        <h1 className="prompt-title">Generate a Prompt</h1>
        <p
          className="api-token-text"
          style={{
            backgroundColor: apiTokens > 0 ? "var(--shadow-color)" : "var(--primary)",
            color: apiTokens <= 0 ? "var(--background)" : "var(--text)"
          }}
        >
          Prompts available: {apiTokens}
        </p>
        <form className="prompt-form" onSubmit={handleSubmit}>
          <label>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="prompt-select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>

          <label>Theme</label>
          <textarea
            placeholder="Enter theme here... (under 30 characters)"
            className={`prompt-input ${themeError ? "input-error" : ""}`}
            value={theme}
            onChange={handleThemeChange}
          />
          {themeError && <p className="theme-error" style={{ color: "red", marginTop: "5px" }}>{themeError}</p>}
          <button type="submit" className="prompt-button" disabled={loading}>
            {loading ? "Generating..." : "Submit"}
          </button>
        </form>

        {response && (
          <div className="prompt-response">
            <h3>Generated Prompt:</h3>
            <p id="response-text">{response.text}</p>
            <Link
              href={{
                pathname: "/typing/test",
                query: {
                  data: btoa(
                    encodeURIComponent(
                      JSON.stringify({
                        testDuration: testDuration,
                        prompt: response.text,
                        promptid: response.promptid,
                      })
                    )
                  ),
                },
              }}
            >
              Use Prompt
            </Link>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        <form className="duration-container">
          <label>Test Duration</label>
          <select
            value={testDuration}
            onChange={(e) => setTestDuration(e.target.value)}
            className="test-duration-select"
          >
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="120">2 minutes</option>
          </select>
        </form>
      </div>
      {/* Previous user prompts */}
      <div className="container">
        <h2>Previous Prompts</h2>
        <table className="previous-prompts">
          <thead>
            <tr>
              <th>PromptId</th>
              <th>Text</th>
              <th>Difficulty</th>
              <th>Theme</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6">Error: {error}</td>
              </tr>
            ) : prevPrompts.length === 0 ? (
              <tr>
                <td colSpan="6">No prompts available...</td>
              </tr>
            ) : (
              prevPrompts.map((prompt) => (
                /**
                 * This is for cases when the user used the same prompt as it might result in same keys in `promptid`
                 * Note this isn't best practice!
                 */
                <tr
                  key={prompt.promptid}
                  onClick={() => {
                    setResponse(prompt);
                  }}
                  className="prompt-row"
                >
                  <td>{prompt.promptid}</td>
                  <td>
                    {prompt.text.length > 20 ? `${prompt.text.slice(0, 50)}...` : prompt.text}
                  </td>
                  <td>{prompt.difficulty}</td>
                  <td>{prompt.theme}</td>
                  <td>{new Date(prompt.date).toISOString().split('T')[0]}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePrompt(prompt.promptid);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
