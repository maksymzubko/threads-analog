/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ["mongoose"],
        serverActionsBodySizeLimit: '10mb',
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
            {
                protocol: "https",
                hostname: "images.clerk.dev",
            },
            {
                protocol: "https",
                hostname: "uploadthing.com",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            },
        ],
    },
};

module.exports = nextConfig;