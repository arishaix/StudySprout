import type { Metadata } from "next";
import { Nunito } from "next/font/google"; 
import Navbar from "./components/Navbar";
import "./globals.css";

import { StudyProvider } from "./lib/StudyContext";
import { ThemeProvider } from "./lib/ThemeContext";

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"], 
});

export const metadata: Metadata = {
  title: "StudySprout",
  description: "Grow your consistency!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <ThemeProvider>
          <StudyProvider>
            <Navbar />
            {children}
          </StudyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
