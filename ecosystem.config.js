module.exports = {
  apps: [
    {
      name: 'irrigate-api',
      script: './server/app.js',
      cwd: '/home/jon/redmercury/irrigate',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      time: true,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'irrigate-frontend',
      script: './client/build/server/index.js',
      cwd: '/home/jon/redmercury/irrigate',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};
