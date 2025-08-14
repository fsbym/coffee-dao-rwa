import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Coffee Shop RWA - Real World Asset Tokenization",
  description:
    "Tokenize coffee shop equity and earn dividends from real business operations. Invest in coffee shops through blockchain technology.",
  keywords:
    "RWA, real world assets, coffee shop investment, blockchain, tokenization, dividends, DeFi",
  authors: [{ name: "Coffee Shop RWA Team" }],
  openGraph: {
    title: "Coffee Shop RWA Platform",
    description:
      "Invest in real coffee shops and earn dividends through blockchain tokenization",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
