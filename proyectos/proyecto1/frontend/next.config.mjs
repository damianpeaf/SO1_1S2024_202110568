/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://192.168.1.22:8080/:path*", // Proxy to Backend
            },
        ];
    },
    output: "standalone",
};

export default nextConfig;
