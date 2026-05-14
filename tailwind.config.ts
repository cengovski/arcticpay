import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arctic: {
          primary: "#00f0ff",
          dark: "#0a1428",
          glass: "rgba(255,255,255,0.1)",
        },
      },
      animation: {
        snow: "snow 10s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
