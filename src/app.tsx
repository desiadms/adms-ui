import { NhostProvider } from "@nhost/react";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { Toaster } from "react-hot-toast";
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
