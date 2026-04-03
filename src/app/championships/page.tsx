"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Calendar, Users, Trophy, RotateCcw } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Empty } from "@/components/ui/empty"

// Mock data
const pastChampionships = [
  {
    id: "1",
    name: "Monthly League February",
    dateRange: "Feb 1 - Feb 28, 2026",
    winner: {
      name: "Carlos Silva",
      avatar: "",
      initials: "CS",
      points: 145.5,
    },
    participants: 87,
  },
  {
    id: "2",
    name: "Monthly League January",
    dateRange: "Jan 1 - Jan 31, 2026",
    winner: {
      name: "Ana Costa",
      avatar: "",
      initials: "AC",
      points: 152.0,
    },
    participants: 92,
  },
  {
    id: "3",
    name: "Year-End Championship",
    dateRange: "Dec 1 - Dec 31, 2025",
    winner: {
      name: "Pedro Santos",
      avatar: "",
      initials: "PS",
      points: 168.5,
    },
    participants: 124,
  },
  {
    id: "4",
    name: "Monthly League November",
    dateRange: "Nov 1 - Nov 30, 2025",
    winner: {
      name: "Maria Oliveira",
      avatar: "",
      initials: "MO",
      points: 139.0,
    },
    participants: 78,
  },
]

export default function ChampionshipsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredChampionships, setFilteredChampionships] = useState(pastChampionships)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredChampionships(pastChampionships)
      return
    }
    const results = pastChampionships.filter((champ) =>
      champ.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredChampionships(results)
  }

  const handleReset = () => {
    setSearchQuery("")
    setFilteredChampionships(pastChampionships)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Championship History</h1>
          <p className="mt-1 text-muted-foreground">
            View closed championships and their final standings
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6 border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by championship name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-input pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Championships Grid */}
        {filteredChampionships.length === 0 ? (
          <Empty
            title="No championships found"
            description="We couldn't find any championships matching the selected filters."
            icon={<Trophy className="h-10 w-10" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredChampionships.map((champ) => (
              <Card
                key={champ.id}
                className="border-border/50 bg-card/50 transition-colors hover:border-primary/50"
              >
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-foreground">{champ.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {champ.dateRange}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                  {/* Winner */}
                  <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Champion</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={champ.winner.avatar} />
                          <AvatarFallback className="bg-primary/20 text-xs text-primary">
                            {champ.winner.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {champ.winner.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {champ.winner.points.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {champ.participants} participants
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/50 pt-4">
                  <Link href={`/championships/${champ.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Final Standings
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
