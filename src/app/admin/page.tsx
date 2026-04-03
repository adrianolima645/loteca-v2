"use client"

import {
  Users,
  Trophy,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock data
const stats = [
  { label: "Active Users", value: "1,248", icon: Users, change: "+12%" },
  { label: "Active Championships", value: "3", icon: Trophy, change: "0" },
  { label: "Open Rounds", value: "2", icon: Calendar, change: "+1" },
  { label: "Bets Today", value: "347", icon: TrendingUp, change: "+28%" },
]

const pendingActions = [
  {
    id: 1,
    type: "result",
    title: "Publish Results - Round 1015",
    description: "All matches completed",
    urgency: "high",
    href: "/admin/results"
  },
  {
    id: 2,
    type: "round",
    title: "Create Round 1017",
    description: "Next round not configured",
    urgency: "medium",
    href: "/admin/rounds/new"
  },
  {
    id: 3,
    type: "championship",
    title: "Close Brasileirão 2024",
    description: "Last round completed",
    urgency: "low",
    href: "/admin/championships"
  },
]

const recentRounds = [
  { id: 1016, status: "open", bets: 892, deadline: "2024-01-15T20:00:00" },
  { id: 1015, status: "pending_results", bets: 1124, deadline: "2024-01-12T20:00:00" },
  { id: 1014, status: "completed", bets: 1089, deadline: "2024-01-08T20:00:00" },
  { id: 1013, status: "completed", bets: 1056, deadline: "2024-01-05T20:00:00" },
]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "default" },
  pending_results: { label: "Pending Results", variant: "secondary" },
  completed: { label: "Completed", variant: "outline" },
}

const urgencyColors: Record<string, string> = {
  high: "bg-destructive/10 border-destructive/30 text-destructive",
  medium: "bg-warning/10 border-warning/30 text-warning-foreground",
  low: "bg-muted border-border text-muted-foreground",
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview for Loteca</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className={`text-xs font-medium ${stat.change.startsWith("+") ? "text-primary" : "text-muted-foreground"}`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Pending Actions</CardTitle>
            </div>
            <CardDescription>Items that require your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent ${urgencyColors[action.urgency]}`}
              >
                <div>
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm opacity-80">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            ))}
            {pendingActions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No pending actions
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Rounds */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Recent Rounds</CardTitle>
              </div>
              <Link href="/admin/rounds">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-mono text-sm font-bold">
                      {round.id}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Round {round.id}</p>
                      <p className="text-xs text-muted-foreground">{round.bets} bets</p>
                    </div>
                  </div>
                  <Badge variant={statusConfig[round.status].variant}>
                    {statusConfig[round.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/rounds/new">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                New Round
              </Button>
            </Link>
            <Link href="/admin/championships/new">
              <Button variant="secondary">
                <Trophy className="mr-2 h-4 w-4" />
                New Championship
              </Button>
            </Link>
            <Link href="/admin/results">
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Publish Results
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
