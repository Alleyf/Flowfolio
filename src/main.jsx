import React from "react";
import ReactDOM from "react-dom/client";
import CinematicApp from "./cinematic/CinematicApp";
import "./cinematic/cinematic.css";

/* Redesign branch: cinematic WebGL portfolio.
   Legacy dashboard entry lives in ./App.jsx (kept for the main branch). */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CinematicApp />
  </React.StrictMode>
);
