import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FluxiBiz - Admin Platform",
  description: "FluxiBiz platform administration dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >{children}
        </ThemeProvider>
          </StoreProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

