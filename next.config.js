/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '10mb',
  },
  output: "standalone",
}

const validate = require('./src/env/validate')
validate.validateEnv()

module.exports = nextConfig
