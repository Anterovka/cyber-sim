import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MUIThemeProvider from "../lib/MUITheme";
import { ThemeModeProvider } from "../lib/ThemeModeContext";

export const metadata: Metadata = {
  title: "CyberSim — Симулятор кибербезопасности",
  description:
    "Интерактивный веб-симулятор для повышения цифровой грамотности и безопасности. Научитесь распознавать киберугрозы через практику.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' }}>
        <ThemeModeProvider>
          <MUIThemeProvider>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </MUIThemeProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
