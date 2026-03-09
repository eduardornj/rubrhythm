/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignora arquivos HTML dentro de node_modules/@mapbox/node-pre-gyp
    config.module.rules.push({
      test: /\.html$/,
      issuer: /node_modules\/@mapbox\/node-pre-gyp/,
      use: "ignore-loader",
    });

    return config;
  },
};

module.exports = nextConfig;