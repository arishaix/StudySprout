import type { Metadata } from "next";
import { Nunito } from "next/font/google"; 
import Navbar from "./components/Navbar";
import "./globals.css";

import { StudyProvider } from "./lib/StudyContext";
import { ThemeProvider } from "./lib/ThemeContext";
import LoaderWrapper from "./components/LoaderWrapper";
import NotificationToast from "./components/NotificationToast";

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"], 
});

export const metadata: Metadata = {
  title: "StudySprout",
  description: "Grow your consistency!",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍄</text></svg>',
  },
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
            <LoaderWrapper>
              <Navbar />
              <NotificationToast />
              {children}
            </LoaderWrapper>
          </StudyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
