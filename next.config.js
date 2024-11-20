/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@uiw/react-markdown-preview', 'react-markdown', 'react-syntax-highlighter'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8080', 'localhost:5000'],
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Increase from default 1mb
    },
    responseLimit: false
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    config.externals.push({
      sqlite3: 'commonjs sqlite3',
    });
    config.externals.push('_http_common');
    return config;
  }
};

module.exports = nextConfig;