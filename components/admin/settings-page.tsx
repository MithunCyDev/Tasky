"use client"

import { useState } from "react"
import type { AdminData } from "@/lib/admin-auth"
import { AdminSidebar } from "./admin-sidebar"
import AdminHeader from "./admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Globe, Shield, Bell } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AdminSettingsPageProps {
  admin: AdminData
}

export default function AdminSettingsPage({ admin }: AdminSettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const { toast } = useToast()

  const handleSaveSettings = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSuccess("Settings updated successfully")
    toast({
      title: "Success",
      description: "Settings have been updated successfully",
    })

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar admin={admin} />

      <div className="md:pl-64 transition-all duration-300">
        <AdminHeader title="System Settings" admin={admin} />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Admin Settings</h1>
            <p className="text-gray-500">Configure system settings and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="inline-flex items-center gap-2">
                <Globe className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="inline-flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4 text-green-500" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Manage general system settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input id="site-name" defaultValue="Ororasoft Task Management" />
                    <p className="text-xs text-muted-foreground">
                      This will be displayed in the browser tab and throughout the application
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select defaultValue="MM/DD/YYYY">
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-switch">Maintenance Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Temporarily disable access to the user side of the application
                      </p>
                    </div>
                    <Switch id="maintenance-switch" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security-related settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input id="session-timeout" type="number" defaultValue="60" />
                    <p className="text-xs text-muted-foreground">
                      Users will be automatically logged out after this period of inactivity
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="password-policy">
                        <SelectValue placeholder="Select password policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basic (min 6 characters)</SelectItem>
                        <SelectItem value="medium">Medium (min 8 characters, letters and numbers)</SelectItem>
                        <SelectItem value="high">
                          Strong (min 10 characters, uppercase, lowercase, numbers, special characters)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="2fa-switch">Require 2FA for Admins</Label>
                      <p className="text-xs text-muted-foreground">
                        Force all admin users to enable two-factor authentication
                      </p>
                    </div>
                    <Switch id="2fa-switch" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ip-logging-switch">IP Address Logging</Label>
                      <p className="text-xs text-muted-foreground">Log IP addresses for login attempts</p>
                    </div>
                    <Switch id="ip-logging-switch" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure system-wide notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Send email notifications for system events</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="task-notifications">Task Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when tasks are created, updated, or completed
                      </p>
                    </div>
                    <Switch id="task-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="user-notifications">User Account Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when new users register or account changes occur
                      </p>
                    </div>
                    <Switch id="user-notifications" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">Admin Notification Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="notification-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">How often to send admin notification summaries</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

