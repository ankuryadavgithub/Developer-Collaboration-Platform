import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { OrganizationProvider } from "./context/OrganizationContext.jsx";
import "./index.css";
import App from "./App.jsx";

axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <OrganizationProvider>
        <App />
      </OrganizationProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);