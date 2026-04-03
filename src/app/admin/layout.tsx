"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  ClipboardCheck,
  Settings,
  ChevronLeft,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rounds", label: "Rounds", icon: Calendar },
  { href: "/admin/championships", label: "Championships", icon: Trophy },
  { href: "/admin/results", label: "Results", icon: ClipboardCheck },
  { href: "/admin/scoring", label: "Scoring", icon: Settings },
]

function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside className={cn("flex flex-col bg-card border-r border-border", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">L</span>
        </div>
        <span className="font-semibold">Admin</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to App
          </Button>
        </Link>
      </div>
    </aside>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AdminSidebar className="hidden md:flex w-56 fixed inset-y-0 left-0" />

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 border-b border-border bg-card p-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <AdminSidebar className="h-full" />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">L</span>
          </div>
          <span className="font-semibold text-sm">Admin</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 pt-16 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
