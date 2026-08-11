// PM2 生态配置 — 墨笺 Inkwell Journal 后端
// 使用方式：pm2 start deploy/ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: 'inkwell-backend',
      cwd: './backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
