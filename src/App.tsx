import { NhostProvider } from "@nhost/react";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { Toaster } from "react-hot-toast";
import { router } from "./router";
import { nhost } from "./hooks";

const registerPrefetchQRScanServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        `${window.location.origin}/PrefetchQrScanServiceWorker.js`,
        {
          scope: "/",
        },
      );
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerPrefetchQRScanServiceWorker();

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
