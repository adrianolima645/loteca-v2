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
  Trophy,
  Users,
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
const championships = [
  {
    id: "1",
    name: "Brasileirão 2025",
    status: "active",
    roundsCount: 16,
    totalRounds: 38,
    participantsCount: 1248,
    startDate: "2025-01-05",
    endDate: "2025-12-08"
  },
  {
    id: "2",
    name: "Copa do Brasil 2025",
    status: "active",
    roundsCount: 3,
    totalRounds: 12,
    participantsCount: 987,
    startDate: "2025-02-01",
    endDate: "2025-10-15"
  },
  {
    id: "3",
    name: "Libertadores 2025",
    status: "upcoming",
    roundsCount: 0,
    totalRounds: 15,
    participantsCount: 0,
    startDate: "2025-03-01",
    endDate: "2025-11-30"
  },
  {
    id: "4",
    name: "Brasileirão 2024",
    status: "completed",
    roundsCount: 38,
    totalRounds: 38,
    participantsCount: 1156,
    startDate: "2024-01-05",
    endDate: "2024-12-08"
  },
  {
    id: "5",
    name: "Copa do Brasil 2024",
    status: "completed",
    roundsCount: 12,
    totalRounds: 12,
    participantsCount: 892,
    startDate: "2024-02-01",
    endDate: "2024-10-15"
  },
]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  upcoming: { label: "Upcoming", variant: "secondary" },
  completed: { label: "Closed", variant: "outline" },
}

export default function ChampionshipsListPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredChampionships = championships.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Championships</h1>
          <p className="text-muted-foreground">Manage Loteca championships</p>
        </div>
        <Link href="/admin/championships/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Championship
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
                placeholder="Search championship..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Championships Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredChampionships.map((championship) => (
          <Card key={championship.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{championship.name}</CardTitle>
                    <Badge
                      variant={statusConfig[championship.status].variant}
                      className="mt-1"
                    >
                      {statusConfig[championship.status].label}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/championships/${championship.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/championships/${championship.id}/edit`}>
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
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Progress */}
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {championship.roundsCount}/{championship.totalRounds} rounds
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(championship.roundsCount / championship.totalRounds) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{championship.participantsCount} participants</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(championship.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link href={`/admin/championships/${championship.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
                {championship.status === "active" && (
                  <Link href={`/admin/rounds/new?championship=${championship.id}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Round
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
