"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data
const rounds = [
  {
    id: 1017,
    championship: "Brasileirão 2025",
    status: "draft",
    matchesCount: 14,
    betsCount: 0,
    deadline: "2025-01-20T20:00:00",
    createdAt: "2025-01-10"
  },
  {
    id: 1016,
    championship: "Brasileirão 2025",
    status: "open",
    matchesCount: 14,
    betsCount: 892,
    deadline: "2025-01-15T20:00:00",
    createdAt: "2025-01-08"
  },
  {
    id: 1015,
    championship: "Brasileirão 2025",
    status: "pending_results",
    matchesCount: 14,
    betsCount: 1124,
    deadline: "2025-01-12T20:00:00",
    createdAt: "2025-01-05"
  },
  {
    id: 1014,
    championship: "Brasileirão 2025",
    status: "completed",
    matchesCount: 14,
    betsCount: 1089,
    deadline: "2025-01-08T20:00:00",
    createdAt: "2025-01-02"
  },
  {
    id: 1013,
    championship: "Brasileirão 2025",
    status: "completed",
    matchesCount: 14,
    betsCount: 1056,
    deadline: "2025-01-05T20:00:00",
    createdAt: "2024-12-28"
  },
]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  open: { label: "Open", variant: "default" },
  pending_results: { label: "Pending Results", variant: "secondary" },
  completed: { label: "Completed", variant: "outline" },
}

export default function RoundsListPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredRounds = rounds.filter((round) => {
    const matchesSearch = round.id.toString().includes(search) ||
      round.championship.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || round.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rounds</h1>
          <p className="text-muted-foreground">Manage Loteca rounds</p>
        </div>
        <Link href="/admin/rounds/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Round
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by number or championship..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending_results">Pending Results</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rounds List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {filteredRounds.length} round{filteredRounds.length !== 1 && "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredRounds.map((round) => (
              <div
                key={round.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent font-mono text-lg font-bold">
                    {round.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Round {round.id}</p>
                      <Badge variant={statusConfig[round.status].variant}>
                        {statusConfig[round.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{round.championship}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{round.matchesCount} matches</span>
                      <span>{round.betsCount} bets</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(round.deadline).toLocaleDateString("en-US")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link href={`/admin/rounds/${round.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/rounds/${round.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
