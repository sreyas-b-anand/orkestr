"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-provider";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Campaigns",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Create Campaign",
    href: "/dashboard/create",
    icon: PlusCircle,
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          onClick={onNavigate}
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-sidebar-border/60">
            <Image
              src="/logo.jpg"
              alt="Orkestr logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-base font-semibold tracking-tight text-sidebar-foreground overflow-hidden whitespace-nowrap"
            >
              Orkestr
            </motion.span>
          )}
        </Link>
        {onCollapse && !collapsed && (
          <button
            onClick={onCollapse}
            className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors hidden lg:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const linkContent = (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-sidebar-primary/15 border border-sidebar-primary/25 rounded-xl"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              <item.icon className="w-4 h-4 relative z-10 shrink-0" />
              {!collapsed && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="px-3 py-4">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}
        >
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.email || "User"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40">
                Authenticated
              </p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "top"}>
              Sign out
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
