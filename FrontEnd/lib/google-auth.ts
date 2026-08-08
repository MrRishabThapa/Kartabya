const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const googleAuthUrl = `${apiUrl}/auth/google`;
