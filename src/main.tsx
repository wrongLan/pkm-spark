import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>
);
