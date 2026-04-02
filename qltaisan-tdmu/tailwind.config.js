/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        header: "hsl(var(--header-bg))",
        "header-foreground": "hsl(var(--header-foreground))",
        sidebar: "hsl(var(--sidebar-background))",
        "sidebar-foreground": "hsl(var(--sidebar-foreground))",
        "sidebar-accent": "hsl(var(--sidebar-accent))",
        "sidebar-border": "hsl(var(--sidebar-border))",
        "login-btn": "hsl(var(--login-btn))",
        "login-btn-foreground": "hsl(var(--login-btn-foreground))",
        "link-hover": "hsl(var(--link-hover))",
        "welcome-text": "hsl(var(--welcome-text))",
      },
    },
  },
  plugins: [],
};

