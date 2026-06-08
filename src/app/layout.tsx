import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gudang Tracker Demo",
  description: "Demo aplikasi pencatatan gudang dan cabang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex bg-slate-50 text-slate-900">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
