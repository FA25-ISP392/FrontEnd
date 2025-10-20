import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://api-monngon88.purintech.id.vn",
        // target: "https://backend2-production-00a1.up.railway.app",
        // target: "https://backend-production-0865.up.railway.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/isp392"), // 👈 thêm /api ở đây, KHÔNG xoá
      },
    },
  },
});
