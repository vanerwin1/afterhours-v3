"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Home,
  CreditCard,
  Users,
  Shield,
  Settings,
  Mic,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  UserCircle,
  Mail,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: <Home className="h-4 w-4" /> }],
  },
  {
    section: "Revenue",
    items: [
      { label: "Stripe", href: "/dashboard/stripe", icon: <CreditCard className="h-4 w-4" /> },
    ],
  },
  {
    section: "Captures",
    items: [
      {
        label: "Leads",
        href: "/dashboard/leads",
        icon: <Mail className="h-4 w-4" />,
      },
      {
        label: "Bookings",
        href: "/dashboard/bookings",
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
  },
  {
    section: "People",
    items: [
      { label: "Users", href: "/dashboard/users", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    section: "Security",
    items: [
      {
        label: "Security Center",
        href: "/dashboard/security",
        icon: <Shield className="h-4 w-4" />,
        roles: ["admin", "super_admin"],
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: <Settings className="h-4 w-4" />,
        roles: ["admin", "super_admin"],
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        label: "My Account",
        href: "/dashboard/account",
        icon: <UserCircle className="h-4 w-4" />,
      },
    ],
  },
]

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  viewer: "Viewer",
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed")
    if (stored !== null) setCollapsed(stored === "true")
  }, [])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebar_collapsed", String(next))
      return next
    })
  }

  const userRole = session?.user?.role ?? "viewer"
  const userName = session?.user?.name ?? session?.user?.email ?? "User"
  const userEmail = session?.user?.email ?? ""
  const userImage = session?.user?.image ?? undefined

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 border-b border-border px-4", collapsed && "justify-center px-2")}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <Mic className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="ml-2.5 overflow-hidden">
              <p className="text-xs font-bold tracking-wider text-foreground whitespace-nowrap">
                COMMAND CENTER
              </p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">AfterHours.AI</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(userRole)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={group.section}>
                {!collapsed && (
                  <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.section}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href)
                    const content = (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <span className={cn(active && "text-primary")}>{item.icon}</span>
                        {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      </Link>
                    )

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{content}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      )
                    }
                    return content
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 py-2 border-t border-border">
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex items-center gap-2 w-full px-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User section */}
        <div className={cn("p-3 border-t border-border", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                <Badge
                  variant={userRole === "super_admin" ? "default" : userRole === "admin" ? "secondary" : "outline"}
                  className="mt-0.5 text-[9px] py-0 px-1.5 h-4"
                >
                  {ROLE_LABELS[userRole] ?? userRole}
                </Badge>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
