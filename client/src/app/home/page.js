"use client"
import { SERVER_BASE_URL } from '@/utils/api'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isLoggedin, setLoggedin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const checkAdmin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.clickclack.aabuharrus.dev/api/v1/auth/me"
        , {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate.");
      }

      const authRes = await response.json();
      setIsAdmin(authRes.data.isAdmin);
      setLoggedin(authRes.data.loggedin)
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      console.log("You're at home, Harry! 🏠")
      setLoading(false)
    }
  }
  
  useEffect(() => {
    checkAdmin();
  }, []);

  return (
    <>
    <div className='container banner'>
      <h1>Ready for some ducktyping?</h1>
      {/* We should make this be the landing page after M2 submission*/}
      {/* <p>This really should just be the landing page...</p> */}
    </div>
      <div className="container">
        {/* <button>Log in</button>
      <button>Sign up</button> */}
        <div className='content-box'>
          <div className='content' >
            <h2>Start another run?</h2>
            <p>Generate new text or use a previous one.</p>
            <button onClick={() => { router.push('/typing/prompt'); }}>Start</button>
          </div>
          <div className='content' >
            <h2>{isAdmin ? 'Admin Profile' : 'Profile'}</h2>
            <button onClick={() => {
              if (isLoggedin) {
                router.push(isAdmin ? '/profile/admin/' : '/profile/user/');
              } else {
                router.push('/');
              }
            }}>Go</button>
          </div>
        </div>
      </div>
    </>
  );
}