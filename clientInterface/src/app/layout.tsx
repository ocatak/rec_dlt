import Header from "@/components/header";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthenticatedContextWrapper } from "@/context/authentication";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Client service",
  description: "REC project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ToastContainer />
      <AuthenticatedContextWrapper>
        <Header />
        {children}
      </AuthenticatedContextWrapper>
      </body>
    </html>
  );
}
