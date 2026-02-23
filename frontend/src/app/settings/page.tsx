"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Shield,
  Bell,
  Monitor,
  Video,
  Globe,
  Key,
  Save,
  Upload,
  Camera,
  Keyboard,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const userName = user?.name || "Marcus Thompson";
  const userEmail = user?.email || "marcus@visiontrack.com";
  const userRole = user?.role || "coach";
  const userTeam = user?.team || "Arsenal FC";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    analysisComplete: true,
    teamUpdates: true,
    weeklyReport: false,
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-1.5 text-xs">
              <Monitor className="h-3.5 w-3.5" />
              Display
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs">
              <Bell className="h-3.5 w-3.5" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1.5 text-xs">
              <Video className="h-3.5 w-3.5" />
              Video
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Team
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="gap-1.5 text-xs">
              <Keyboard className="h-3.5 w-3.5" />
              Shortcuts
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                      {userInitials}
                    </div>
                    <Button size="icon" variant="outline" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full">
                      <Camera className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold">{userName}</h3>
                    <p className="text-sm text-muted-foreground">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} &middot; {userTeam}</p>
                    <Button variant="outline" size="sm" className="mt-2 gap-1">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={userName} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={userEmail} type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select defaultValue={userRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="athlete">Athlete</SelectItem>
                        <SelectItem value="scout">Scout</SelectItem>
                        <SelectItem value="team_manager">Team Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sport</Label>
                    <Select defaultValue={user?.sport || "soccer"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soccer">Soccer / Football</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                        <SelectItem value="baseball">Baseball</SelectItem>
                        <SelectItem value="tennis">Tennis</SelectItem>
                        <SelectItem value="hockey">Hockey</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Team / Organization</Label>
                    <Input defaultValue={userTeam} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue="+44 20 7619 5003" type="tel" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Security
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" placeholder="Enter current password" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" placeholder="Enter new password" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Switch />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="sport" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize the appearance of your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Optimized for video viewing</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <div className="flex gap-3">
                    {[
                      { name: "Soccer Green", color: "bg-emerald-500", active: true },
                      { name: "Basketball Orange", color: "bg-orange-500", active: false },
                      { name: "Baseball Red", color: "bg-red-500", active: false },
                      { name: "Tennis Yellow", color: "bg-yellow-500", active: false },
                      { name: "Hockey Blue", color: "bg-blue-500", active: false },
                    ].map((theme) => (
                      <button key={theme.name} className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${theme.active ? "bg-secondary ring-2 ring-primary" : "hover:bg-secondary/50"}`}>
                        <div className={`h-8 w-8 rounded-full ${theme.color}`} />
                        <span className="text-[10px] text-muted-foreground">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>High Contrast Mode</Label>
                    <p className="text-xs text-muted-foreground">For outdoor viewing</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Sidebar</Label>
                    <p className="text-xs text-muted-foreground">Show icons only in sidebar</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "analysisComplete", label: "Analysis Complete", desc: "When video analysis finishes" },
                  { key: "teamUpdates", label: "Team Updates", desc: "Roster and schedule changes" },
                  { key: "weeklyReport", label: "Weekly Report", desc: "Automated weekly performance summary" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <Label>{item.label}</Label>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video */}
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>Video & Analysis Settings</CardTitle>
                <CardDescription>Configure video playback and analysis defaults</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Playback Quality</Label>
                  <Select defaultValue="1080p">
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p (Recommended)</SelectItem>
                      <SelectItem value="4k">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Analysis Frame Rate</Label>
                  <Select defaultValue="every5">
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="every">Every frame</SelectItem>
                      <SelectItem value="every5">Every 5th frame</SelectItem>
                      <SelectItem value="every10">Every 10th frame</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-generate thumbnails</Label>
                    <p className="text-xs text-muted-foreground">Create thumbnails on upload</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-detect jersey numbers</Label>
                    <p className="text-xs text-muted-foreground">AI detection during analysis</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Detection Confidence Threshold</Label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="0" max="100" defaultValue="75" className="flex-1" />
                    <span className="text-sm font-medium w-10">75%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select defaultValue="mp4">
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4</SelectItem>
                      <SelectItem value="mov">MOV</SelectItem>
                      <SelectItem value="avi">AVI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Branding</CardTitle>
                <CardDescription>Customize team colors and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-lg bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <Label>Team Logo</Label>
                    <p className="text-xs text-muted-foreground mb-2">Upload your team logo (PNG, SVG)</p>
                    <Button variant="outline" size="sm">Upload Logo</Button>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-red-600 border border-border" />
                      <Input defaultValue="#DC2626" className="w-28 font-mono text-xs" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-white border border-border" />
                      <Input defaultValue="#FFFFFF" className="w-28 font-mono text-xs" />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Watermark on exports</Label>
                    <p className="text-xs text-muted-foreground">Add team logo to exported videos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortcuts */}
          <TabsContent value="shortcuts">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
                <CardDescription>Video player and navigation shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Play / Pause", keys: "Space" },
                    { action: "Frame Forward", keys: "→" },
                    { action: "Frame Backward", keys: "←" },
                    { action: "Speed Up", keys: "Shift + →" },
                    { action: "Speed Down", keys: "Shift + ←" },
                    { action: "Toggle Fullscreen", keys: "F" },
                    { action: "Add Marker", keys: "M" },
                    { action: "Screenshot", keys: "S" },
                    { action: "Toggle Drawing", keys: "D" },
                    { action: "Undo", keys: "Ctrl + Z" },
                    { action: "Toggle Sidebar", keys: "Ctrl + B" },
                    { action: "Search", keys: "Ctrl + K" },
                  ].map((shortcut) => (
                    <div key={shortcut.action} className="flex items-center justify-between py-1.5">
                      <span className="text-sm">{shortcut.action}</span>
                      <Badge variant="secondary" className="font-mono text-xs">{shortcut.keys}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>Connect external services and data sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "GPS/Wearables", desc: "Import tracking data from GPS devices", connected: true },
                { name: "Multi-Camera", desc: "Connect multiple camera feeds", connected: false },
                { name: "Stats API", desc: "Sync with external statistics providers", connected: true },
                { name: "Calendar Sync", desc: "Sync with Google/Outlook calendar", connected: false },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.desc}</p>
                  </div>
                  <Badge variant={integration.connected ? "success" : "outline"}>
                    {integration.connected ? "Connected" : "Connect"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
