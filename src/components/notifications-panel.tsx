"use client"

import { useState } from "react"
import { Bell, Trophy, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: "round_open" | "deadline" | "results"
  message: string
  timestamp: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "round_open",
    message: "Round #48 is open — place your bet!",
    timestamp: "Just now",
    read: false,
  },
  {
    id: "2",
    type: "deadline",
    message: "Round #47 closes in 2 hours — you haven't submitted yet!",
    timestamp: "30 min ago",
    read: false,
  },
  {
    id: "3",
    type: "results",
    message: "Results published for Round #46 — you scored 11 points!",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "results",
    message: "Results published for Round #45 — you scored 9 points!",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "round_open",
    message: "Round #47 is open — place your bet!",
    timestamp: "3 days ago",
    read: true,
  },
]

const iconMap = {
  round_open: Bell,
  deadline: Clock,
  results: Trophy,
}

function NotificationItem({ notification, onMarkAsRead }: { notification: Notification; onMarkAsRead: (id: string) => void }) {
  const Icon = iconMap[notification.type]

  return (
    <button
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
      className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          notification.type === "deadline"
            ? "bg-warning/20"
            : notification.type === "results"
            ? "bg-primary/20"
            : "bg-accent"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            notification.type === "deadline"
              ? "text-warning"
              : notification.type === "results"
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        />
      </div>
      <div className="flex-1 space-y-1">
        <p className={`text-sm ${!notification.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
      </div>
      {!notification.read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}

function NotificationsList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}) {
  const unreadCount = notifications.filter((n) => !n.read).length

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <p className="font-medium text-foreground">You&apos;re all caught up</p>
        <p className="text-sm text-muted-foreground">No notifications at this time</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="h-auto p-0 text-sm text-primary hover:bg-transparent hover:text-primary/80"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-1 p-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const content = (
    <NotificationsList
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  )

  return (
    <>
      {/* Desktop: Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hidden md:flex">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          {content}
        </PopoverContent>
      </Popover>

      {/* Mobile: Sheet (Bottom) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative md:hidden">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    </>
  )
}
