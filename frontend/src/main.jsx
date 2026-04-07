// ================================================
// MAIN.JSX - Entry point của ứng dụng React
// Mô tả: Render App component vào DOM, import CSS toàn cục
// ================================================
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// CSS toàn diện cho toàn bộ ứng dụng (variables, layout, components...)
import "./styles/app.css";
import "./styles/navbar.css";
// App component chính (định tuyến)
import App from "./App.jsx";

// Render ứng dụng vào element có id="root"
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
