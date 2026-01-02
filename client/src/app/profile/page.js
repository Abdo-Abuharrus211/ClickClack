'use client'

import { SERVER_BASE_URL } from "@/utils/api";
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState();

  useEffect(() => {
    const getProfileData = async () => {  
      try {
        const response = await fetch("https://api.clickclack.aabuharrus.dev/api/v1/users/profile/",
          {
            credentials: 'include'
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to get profile.");
        }
  
        const data = await response.json();
        console.log("Profile data: ", data);
        setProfileData(data);
  
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  return (
  <>
    <h1>This is a profile page</h1>
    <p>Here is the data: </p>
    <p>{JSON.stringify(profileData)}</p>
  </>
  )
}