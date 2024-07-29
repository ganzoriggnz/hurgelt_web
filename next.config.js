/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '*',
      },
      {
        protocol: 'https',
        hostname: 'firebaseinstallations.googleapis.com',
        port: '',
        pathname: '*',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '*',
      },
      {
        protocol: 'https',
        hostname: 'goyshop.com',
        port: '',
        pathname: '*',
      },
    ],
    // domains: ['lh3.googleusercontent.com', 'https://firebaseinstallations.googleapis.com', 'https://goyshop.com'],
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  reactStrictMode: false,

}

module.exports = nextConfig
