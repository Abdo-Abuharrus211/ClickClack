"use client"

import Scoreboard from '@/app/partials/scoreboard';
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getUserProfile } from '../../../utils/api'
import { logOutReq } from '../../../utils/api';


export default function UserProfile() {
  const router = useRouter()
  const [apiTokens, setApiTokens] = useState(0)
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const logOut = async () => {
    setLoading(true)
    try {

    } catch (error) {
      console.log(error);
      setError(Error)
    } finally {
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
        const trials = response.tokenCount // trials is just another word for tokens cuz naming...
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

  const logout = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await logOutReq();
      console.log(response);
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
      router.push('/')
    }
  }


  return (
    <div className="container">

      <div className='content-box'>
        <div className='content' >
          <h4>Start another run?</h4>
          <p>Generate new text or use a previous one.</p>
          <button onClick={() => { router.push('/typing/prompt'); }}>Start</button>
        </div>
        <div className='content'>
          <h4>Control pannel</h4>
          <p>Remaining tokens: {apiTokens}</p>
          <button
            type="submit"
            className="logout-btn"
            disabled={loading}
            onClick={() => {logout()}}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
      <Scoreboard />
    </div>
  )
}