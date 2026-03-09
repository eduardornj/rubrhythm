"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionWrapperProps {
  children: ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
}