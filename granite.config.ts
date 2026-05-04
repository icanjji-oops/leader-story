import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "leader-story",
  brand: {
    displayName: "성공일기10코어", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#4DB6AC", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://leader-story.vercel.app/diamond-icon.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
