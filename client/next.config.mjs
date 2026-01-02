/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // Matches all API routes
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "https://click-clack-vercel-server.vercel.app" },  // ✅ Must match server
            { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          ],
        },
      ];
    },
    reactStrictMode: true,
  };
  
  export default nextConfig;
  