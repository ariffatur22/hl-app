import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
})(nextConfig);
