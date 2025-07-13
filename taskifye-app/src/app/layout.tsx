import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskifye - Integration Hub",
  description: "Connect all your business tools in one dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}