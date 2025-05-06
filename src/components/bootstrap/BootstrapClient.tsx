// components/BootstrapClient.tsx
"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
    .then(() => {
      console.log("Bootstrap JS loaded successfully!");
    })
    .catch((error) => {
      console.error("Error loading Bootstrap JS:", error);
    });
  }, []);

  return null;
}
