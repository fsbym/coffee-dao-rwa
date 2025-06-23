import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Coffee DAO RWA - 咖啡代币化平台",
  description: "基于区块链的咖啡代币化平台，让每一杯咖啡都有独特的数字身份",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
