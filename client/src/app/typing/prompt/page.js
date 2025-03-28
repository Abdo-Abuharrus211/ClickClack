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
  const [prevPrompts, setPrevPrompts] = useState([])
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
      const response = await fetch("http://localhost:3001/api/v1/ai/generate-test-prompt/", {
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
      console.log("AI generated text:", res.data);
      setPrevPrompts(res.data)
      setApiTokens(prev => prev - 1)
      setResponse(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrevPrompts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:3001/api/v1/users/get-previous-prompts/", {
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
      console.log("Previous prompts 🍉:", res.data);
    } catch (error) {
      console.error("Error fetching previous prompts:", error);
      setError(error);
    }finally{
      console.log("Previous prompts:", prevPrompts);
      setLoading(false)
    }
  }

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
          style={{ backgroundColor: apiTokens > 0 ? "var(--shadow-color)" : "var(--primary)" ,
            color: apiTokens <= 0 ? "var(--background)" : "var(--text)"}}
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
        <table className="previous-prompts ">
          <thead>
            <tr>
              <th>PromptID</th>
              <th>Text</th>
              <th>Difficulty</th>
              <th>Theme</th>
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
              <tr
              // TODO: test this later when we have tests in DB
                key={prompt.promptid}
                onClick={() => {
                  setResponse(prompt)
                }}
                className="prompt-row"
              >
                <td>{prompt.promptid}</td>
                <td>
                  {prompt.text.length > 20 ? `${prompt.text.slice(0, 50)}...`: prompt.text}
                  </td>
                <td>{prompt.difficulty}</td>
                <td>{prompt.theme}</td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </>
  );
}
