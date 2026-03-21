import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./styles.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6ef2ff" },
    secondary: { main: "#ffb865" },
    background: { default: "#061018", paper: "rgba(9, 19, 30, 0.84)" },
    text: { primary: "#edf7ff", secondary: "#8fa8be" },
  },
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: '"MiSans","HarmonyOS Sans SC","PingFang SC","Microsoft YaHei","Segoe UI",sans-serif',
    h1: { fontWeight: 900, letterSpacing: "-0.04em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: "none" },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
