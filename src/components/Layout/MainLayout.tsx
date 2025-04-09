import React from "react";
import { Outlet } from "react-router-dom";
import MainNav from "./MainNav";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 container py-6">{children || <Outlet />}</main>
      <footer className="border-t py-4 bg-background">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Warehouse Box & Unit Management
            System
          </p>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
