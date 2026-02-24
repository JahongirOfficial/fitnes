module.exports = {
  apps: [
    // ── Express backend ──────────────────────────────────────────────────────
    {
      name: "fitnes-backend",
      script: "server/src/server.js",
      cwd: "/var/www/fitnes",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/var/log/pm2/fitnes-backend-error.log",
      out_file: "/var/log/pm2/fitnes-backend-out.log",
      max_memory_restart: "500M",
      restart_delay: 3000,
    },

    // ── Next.js frontend ──────────────────────────────────────────────────────
    {
      name: "fitnes-frontend",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/fitnes",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/fitnes-frontend-error.log",
      out_file: "/var/log/pm2/fitnes-frontend-out.log",
      max_memory_restart: "500M",
      restart_delay: 3000,
    },

    // ── Telegram bot ──────────────────────────────────────────────────────────
    {
      name: "optimum-bot",
      script: "bot.js",
      cwd: "/var/www/fitnes/telegram-bot",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
      // 409 xatosi bo'lganda avtomatik restart oldini olish:
      // bot o'zi polling_error orqali qayta urinadi
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: "10s",
      error_file: "/var/log/pm2/optimum-bot-error.log",
      out_file: "/var/log/pm2/optimum-bot-out.log",
      max_memory_restart: "200M",
    },
  ],
};
