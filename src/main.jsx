import React from "react";
import { createRoot } from "react-dom/client";
import TabataBuilder from "./TabataBuilder.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TabataBuilder />
  </React.StrictMode>
);
