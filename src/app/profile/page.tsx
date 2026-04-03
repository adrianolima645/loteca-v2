"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Camera, Mail, User, Bell, Trophy, Target, TrendingUp } from "lucide-react"

// Mock user data
const userData = {
  name: "João Silva",
  email: "joao.silva@email.com",
  avatar: "",
  initials: "JS",
  stats: {
    totalPoints: 342.5,
    roundsPlayed: 28,
    correctPredictions: 298,
    accuracy: 76,
    bestRound: 13,
    currentRank: 5,
  },
  preferences: {
    emailNotifications: true,
    roundReminders: true,
    resultAlerts: true,
  },
}

export default function ProfilePage() {
  const [name, setName] = useState(userData.name)
  const [preferences, setPreferences] = useState(userData.preferences)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("Profile updated successfully!")
  }

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your information and preferences
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Profile & Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Card */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userData.avatar} />
                      <AvatarFallback className="bg-primary/20 text-xl text-primary">
                        {userData.initials}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change photo</span>
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{userData.name}</p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      disabled
                      className="bg-input opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email linked to Google account
                    </p>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Notifications Preferences */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates by email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={() => togglePreference("emailNotifications")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Round Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a round is about to close
                    </p>
                  </div>
                  <Switch
                    checked={preferences.roundReminders}
                    onCheckedChange={() => togglePreference("roundReminders")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Result Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when results are published
                    </p>
                  </div>
                  <Switch
                    checked={preferences.resultAlerts}
                    onCheckedChange={() => togglePreference("resultAlerts")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-6">
            {/* Overall Stats */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {userData.stats.totalPoints.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                  </div>
                  <div className="rounded-lg bg-accent p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      #{userData.stats.currentRank}
                    </p>
                    <p className="text-xs text-muted-foreground">Current Rank</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      Accuracy
                    </span>
                    <span className="font-semibold text-foreground">
                      {userData.stats.accuracy}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rounds Played</span>
                    <span className="font-semibold text-foreground">
                      {userData.stats.roundsPlayed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Correct</span>
                    <span className="font-semibold text-foreground">
                      {userData.stats.correctPredictions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      Best Round
                    </span>
                    <span className="font-semibold text-primary">
                      {userData.stats.bestRound}/14
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Irreversible actions. Proceed with caution.
                </p>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
