import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./app.css";

const rootEl = document.getElementById("app");

if (!rootEl) {
  throw new Error("No root element");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
