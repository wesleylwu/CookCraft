import "./globals.css";
import { Inter } from "next/font/google";
import { ReactQueryClientProvider } from "@/utils/react-query";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Cookbook",
  description:
    "AI Cookbook turns your ingredients into recipes. Just list what you have, and it instantly creates meal ideas",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
      </body>
    </html>
  );
}
