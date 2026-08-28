import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/session-provider";
import { ThemeScript } from "@/components/theme-script";
import { ThemeSync } from "@/components/theme-sync";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Seguros de Vida",
  description: "CRM para agentes de seguros de vida",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const theme = session?.user?.theme ?? "SYSTEM";

  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-gray-50 font-sans text-gray-900">
        <ThemeScript theme={theme} />
        <ThemeSync theme={theme} />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
