import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { NavBar } from "./components/NavBar";
import "./styles/glass.css"; // glass‑card utilities
import "./index.css";        // base theme (dark mode already defined)

function App() {
  return (
    <div className="app-container">
      {/* Persistent navigation */}
      <NavBar />
      {/* Main content – routes */}
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;;
