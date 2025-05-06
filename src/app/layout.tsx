"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from "@components/navbar/page";
import { Provider } from "react-redux";
import { store, persistor } from "@store/store";
import { PersistGate } from "redux-persist/integration/react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
        <body>
          <PersistGate loading={null} persistor={persistor}>
            <Navbar />
            {children}
          </PersistGate>
        </body>
      </Provider>
    </html>
  );
}
