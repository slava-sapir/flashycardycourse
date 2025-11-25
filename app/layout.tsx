import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
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
          colorBackground: "hsl(0 0% 14.5%)",
          colorInputBackground: "hsl(0 0% 20.5%)",
          colorInputText: "hsl(0 0% 98.5%)",
          colorText: "hsl(0 0% 98.5%)",
          colorTextSecondary: "hsl(0 0% 70.8%)",
          colorPrimary: "hsl(0 0% 92.2%)",
          colorTextOnPrimaryBackground: "hsl(0 0% 9%)",
          colorDanger: "hsl(0 70.4% 19.1%)",
          colorNeutral: "hsl(0 0% 26.9%)",
          borderRadius: "0.625rem",
        },
        elements: {
          card: "bg-card border-border",
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          userButtonPopoverCard: "bg-popover border border-border shadow-lg",
          userButtonPopoverActions: "bg-popover",
          userButtonPopoverActionButton: "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
          userButtonPopoverActionButtonText: "text-popover-foreground",
          userButtonPopoverActionButtonIcon: "text-popover-foreground",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${poppins.variable} antialiased`} suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Header />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
