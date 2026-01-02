import { getTests, SERVER_BASE_URL } from "@/utils/api";
import { useEffect, useState } from "react"

export default function Scoreboard() {
  const [scores, setScores] = useState([])
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.clickclack.aabuharrus.dev/api/v1/tests/get-tests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error("Failed to fetch scores.");
      }
      // const response = await getTests()

      const fetched = await response.json()
      setScores(fetched.data.tests)
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchScores()
  }, []);

  return (
    <div className="scoreboard container">
      <h3>Previous Trials</h3>
      {/* Structure and display scores as a table */}
      <table className="score-table">
        <thead>
          <tr>
            <th>Prompt ID</th>
            <th>Text</th> 
            <th>Date</th>
            <th>WPM</th>
            <th>AWPM</th>
            <th>Difficulty</th>
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
          ) : scores.length === 0 ? (
            <tr>
              <td colSpan="6">No scores available...</td>
            </tr>
          ) : (
            scores.map((score, index) => (
              /**
               * This is to a tests where the user used the same propmt as it might result in same keys in `promptid`
               * Note this isn't best practice.
               */
              <tr key={score.promptid + index}>
                <td>{score.promptid}</td>
                <td>
                  {score.text.length > 20
                    ? `${score.text.slice(0, 50 )}...`
                    : score.text}
                </td>
                {/*TODO: Ignoring the UTC format returned by the DB for demo purposes */}
                {/* <td>{new Date(score.date).toLocaleDateString()}</td> */}
                <td>{new Date(score.date).toISOString().split('T')[0]}</td>
                <td>{score.wpm}</td>
                <td>{score.awpm}</td>
                <td>{score.difficulty}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}