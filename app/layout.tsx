import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/header";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flashy Cardy Course",
  description: "Learn with interactive flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorBackground: "var(--background)",
          colorText: "var(--foreground)",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${poppins.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Header />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
