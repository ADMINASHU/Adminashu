import React from "react";
import { AuthProvider } from "./context/AuthProvider";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
