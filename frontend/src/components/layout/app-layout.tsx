"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, darkMode } = useAppStore();

  return (
    <div className={cn(darkMode && "dark")}>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-all duration-300",
            sidebarOpen ? "ml-64" : "ml-16"
          )}
        >
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
