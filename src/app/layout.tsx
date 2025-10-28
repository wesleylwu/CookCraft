import "./globals.css";
import { Roboto } from "next/font/google";
import { ReactQueryClientProvider } from "@/utils/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "CookCraft",
  description:
    "CookCraft turns your ingredients into recipes. Just list what you have, and it instantly creates meal ideas",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AuthProvider>
          <NavBar />
          <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
