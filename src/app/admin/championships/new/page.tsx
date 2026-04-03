"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Trophy } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function NewChampionshipPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalRounds: "",
    startDate: "",
    endDate: "",
    isPublic: true,
    allowLateEntry: true,
  })

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (publish: boolean) => {
    if (!formData.name || !formData.totalRounds || !formData.startDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success(
      publish
        ? "Championship created successfully"
        : "Championship saved as draft"
    )

    router.push("/admin/championships")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/championships">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Championship</h1>
          <p className="text-muted-foreground">Configure a new championship</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General championship details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Championship Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Brasileirão 2025"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional championship description..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="totalRounds">Total Rounds *</Label>
                  <Input
                    id="totalRounds"
                    type="number"
                    placeholder="e.g. 38"
                    value={formData.totalRounds}
                    onChange={(e) => updateField("totalRounds", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Championship rules and visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">Public Championship</Label>
                  <p className="text-sm text-muted-foreground">
                    Visible to all platform users
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(v) => updateField("isPublic", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowLateEntry">Allow Late Entry</Label>
                  <p className="text-sm text-muted-foreground">
                    New participants can join after the start
                  </p>
                </div>
                <Switch
                  id="allowLateEntry"
                  checked={formData.allowLateEntry}
                  onCheckedChange={(v) => updateField("allowLateEntry", v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                <Eye className="mr-2 h-4 w-4" />
                Publish Championship
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {formData.name || "Championship Name"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.totalRounds || "0"} rounds
                    </p>
                  </div>
                </div>
                {formData.description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {formData.description}
                  </p>
                )}
                <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                  {formData.startDate && (
                    <span>
                      Start: {new Date(formData.startDate).toLocaleDateString("en-US")}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
