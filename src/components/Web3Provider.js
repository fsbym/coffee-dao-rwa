"use client";

import { Web3ContextProvider } from "./Web3Context";

export function Web3Provider({ children }) {
  return <Web3ContextProvider>{children}</Web3ContextProvider>;
}
