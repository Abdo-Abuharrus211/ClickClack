const API_ROOT = 'http://localhost:3001/api/v1'

/**
 *  Get the user's basic info like display name and API tokens (trials) the user has
 * 
 * @returns JSON object containing their data
 */
export async function getUserProfile(){
    const response = await fetch("http://localhost:3001/api/v1/users/profile/", {
        credentials: "include",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }
    const info = await response.json();
    return info.data;
}


export async function logOutReq(){
    const response = await fetch(`http://localhost:3001/api/v1/auth/logout/`, {
        credentials: "include",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    console.log(response)
    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }
    return response.message
}
