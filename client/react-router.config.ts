import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  // ssr: false,

  // Configure the app directory (defaults to "app")
  appDirectory: "app",

  // Configure routes
  routes: "./app/routes.ts",
} satisfies Config;
