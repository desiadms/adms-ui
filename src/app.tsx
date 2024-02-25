import { NhostProvider } from "@nhost/react";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "preact/compat";
import { Toaster } from "react-hot-toast";
import "./app.css";
import { router } from "./router";
import { nhost } from "./utils";

export function App() {
  return (
    <StrictMode>
      <NhostProvider nhost={nhost}>
        <RouterProvider router={router} />
        <Toaster />
      </NhostProvider>
    </StrictMode>
  );
}
