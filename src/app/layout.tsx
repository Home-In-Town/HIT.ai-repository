import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/store/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeInTown",
  description: "Search Property",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
