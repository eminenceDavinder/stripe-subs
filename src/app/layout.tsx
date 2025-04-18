'use client';
import Navbar from "@/components/navbar/page";
import "./globals.css";
import { Provider } from "react-redux";
import store from "@/store/store";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
        <body>
          <Navbar />
          {children}
        </body>
      </Provider>
    </html>
  );
}
