"use client";

import Scoreboard from "@/app/partials/scoreboard";
import "../../../styles/prompt-page.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserProfile } from "@/utils/api";

export default function PromptPage() {
  const [difficulty, setDifficulty] = useState("easy");
  const [testDuration, setTestDuration] = useState("30");
  const [theme, setText] = useState("");
  const [apiTokens, setApiTokens] = useState(0);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const requestData = {
      difficulty: difficulty,
      theme: theme,
    };

    try {
      const res = await fetch("http://localhost:3001/api/v1/ai/generate-test-prompt/", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        throw new Error("Failed to generate prompt.");
      }

      const data = await res.json();
      console.log("AI generated text:", data.data);
      setResponse(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() =>{
    // THIS IS IN HERE CUZ BREAK OTHERWISE - React moment
    const fetchTokens = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getUserProfile();
        const trials = response.tokenCount
        console.log("User has ", apiTokens);
        setApiTokens(trials)
  
      }catch(error) {
        console.log("Error fetching the user's trials", error);
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchTokens();
  }, [])


  return (
    <>
      <div className="prompt-container">
        <h1 className="prompt-title">Generate a Prompt</h1>
        <p className="api-token-text">Prompts available: {apiTokens}</p>
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
            placeholder="Enter theme here..."
            className="prompt-input"
            value={theme}
            onChange={(e) => setText(e.target.value)}
          />

          <button type="submit" className="prompt-button" disabled={loading}>
            {loading ? "Generating..." : "Submit"}
          </button>
        </form>

        {response && (
          <div className="prompt-response">
            <h3>Generated Prompt:</h3>
            <p>{response.text}</p>
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
      <Scoreboard />
    </>
  );
}
