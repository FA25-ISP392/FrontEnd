import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://api-monngon88.purintech.id.vn",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/isp392"), // 👈 thêm /api ở đây, KHÔNG xoá
      },
    },
  },
});
