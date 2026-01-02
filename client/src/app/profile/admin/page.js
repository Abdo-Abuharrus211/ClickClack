"use client"

import Scoreboard from '@/app/partials/scoreboard';
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getUserProfile, SERVER_BASE_URL } from '../../../utils/api'
import { logOutReq } from '../../../utils/api';

export default function UserProfile() {
    const router = useRouter()
    const [error, setError] = useState(null);
    const [displayName, setDisplayName] = useState(null)
    const [apiTokens, setApiTokens] = useState(0)
    const [usersData, setUsersData] = useState([]);
    const [endpointUsageData, setEndpointUsageData] = useState([]);
    const [loading, setLoading] = useState(false);

    /**
     * Fetch the Users data for the Admin dash board
     */
    const fetchUsersData = async () => {
        setLoading(true);
        setError(null);
        try{
            const response = await fetch('https://api.clickclack.aabuharrus.dev/api/v1/users/admin/', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Failed to fectch users' data for admin page!");
            }
            const res = await response.json();
            setUsersData(res.data)
        } catch (error) {
            console.log("Error fetching data: ", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Fetch the endpoint usage data for the Admin dash board
     */
    const fetchEndpointUsageData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${SERVER_BASE_URL}/endpoints/usage/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Failed to fectch endpoint usage data for admin page!");
            }
            const res = await response.json();
            setEndpointUsageData(res.data)
        } catch (error) {
            console.log("Error fetching data: ", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    const boostUserTokens = async (userid) => {
        setLoading(true)
        setError(null)
        console.log("userid: ", userid)
        try {
            const response = await fetch(`${SERVER_BASE_URL}/users/boost-tokens/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({ userid })
            });
            if (!response.ok) {
                throw new Error("Failed to fectch users' data for admin page!");
            }
            const res = await response.json();
            console.log("User boosted: ", res)
        } catch (error) {
            console.log("Error boosting: ", error)
            setError(error)
        } finally {
            setLoading(false);
            setUsersData(prev =>
                prev.map(user =>
                  user.userid === userid ? { ...user, tokenCount: 20 } : user
                )
              );
        }
    }


    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await getUserProfile();
                setApiTokens(response.tokenCount);
                setDisplayName(response.displayName);

            } catch (error) {
                console.log("Error fetching profile", error);
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile();
        fetchUsersData();
        fetchEndpointUsageData();
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
        <>
            <div className="container">
                <h1><em>You&apos;re an Admin Duck, {displayName}!</em></h1>

                <h2>API Usage</h2>
                <div className='content-box'>
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Endpoint</th>
                                <th>Requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3">Loading...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3">Error loading data</td>
                                </tr>
                            ) : (
                                endpointUsageData && endpointUsageData.length > 0 ? (
                                    endpointUsageData.map((endpoint, index) => (
                                        <tr key={index}>
                                            <td>{endpoint.method}</td>
                                            <td>{endpoint.endpoint}</td>
                                            <td>{endpoint.requests}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No data available</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <h2>All Ducklings (users)</h2>
                <div className='content-box'>
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Tokens Available</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4">Loading...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="4">Error loading data</td>
                                </tr>
                            ) : (
                                usersData && usersData.length > 0 ? (
                                    usersData.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.displayName}</td>
                                            <td>{user.tokenCount}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <button onClick={() => boostUserTokens(user.userid)}>
                                                    Boost Tokens
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No data available</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='content-box'>
                    <div className='content' >
                        <h4>Start another run?</h4>
                        <p>Generate new text or use a previous one.</p>
                        <button onClick={() => { router.push('/typing/prompt'); }}>Start</button>
                    </div>
                    <div className='content'>
                        <h4>Control Pannel</h4>
                        <p>Remaining tokens: {apiTokens}</p>
                        <button type="submit" className="logout-btn" disabled={loading} onClick={() => { logout() }}>{loading ? "Logging out..." : "Logout"}</button>

                    </div>
                </div>
                <Scoreboard />
            </div>
        </>
    )
}