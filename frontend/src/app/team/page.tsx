"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { cn, getInitials } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Upload,
  Shield,
  Edit,
  Trash2,
  BarChart3,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Presentation,
  Video,
  FolderOpen,
  Plus,
  Search,
  ChevronRight,
  CheckSquare,
  Pin,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlayerRecord {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  age: number;
  nationality: string;
  flag: string;
  status: "Active" | "Injured" | "Suspended";
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface ScheduleEvent {
  id: string;
  title: string;
  type: "match" | "training" | "rest" | "analysis";
  time: string;
}

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  assignedPlayers: number;
  completion: number;
  status: "Active" | "Completed" | "Upcoming";
}

interface Announcement {
  id: string;
  author: string;
  date: string;
  title: string;
  message: string;
  pinned: boolean;
}

interface FileRecord {
  id: string;
  filename: string;
  type: "pdf" | "ppt" | "video";
  size: string;
  uploadedBy: string;
  date: string;
  folder: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockPlayers: PlayerRecord[] = [
  { id: "p1", name: "Aaron Ramsdale", jerseyNumber: 1, position: "Goalkeeper", age: 25, nationality: "England", flag: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", status: "Active" },
  { id: "p2", name: "Ben White", jerseyNumber: 4, position: "Defender", age: 26, nationality: "England", flag: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", status: "Active" },
  { id: "p3", name: "William Saliba", jerseyNumber: 12, position: "Defender", age: 23, nationality: "France", flag: "\uD83C\uDDEB\uD83C\uDDF7", status: "Active" },
  { id: "p4", name: "Gabriel Magalhaes", jerseyNumber: 6, position: "Defender", age: 26, nationality: "Brazil", flag: "\uD83C\uDDE7\uD83C\uDDF7", status: "Active" },
  { id: "p5", name: "Oleksandr Zinchenko", jerseyNumber: 35, position: "Defender", age: 27, nationality: "Ukraine", flag: "\uD83C\uDDFA\uD83C\uDDE6", status: "Injured" },
  { id: "p6", name: "Thomas Partey", jerseyNumber: 5, position: "Midfielder", age: 30, nationality: "Ghana", flag: "\uD83C\uDDEC\uD83C\uDDED", status: "Active" },
  { id: "p7", name: "Declan Rice", jerseyNumber: 41, position: "Midfielder", age: 25, nationality: "England", flag: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", status: "Active" },
  { id: "p8", name: "Martin Odegaard", jerseyNumber: 8, position: "Midfielder", age: 25, nationality: "Norway", flag: "\uD83C\uDDF3\uD83C\uDDF4", status: "Active" },
  { id: "p9", name: "Bukayo Saka", jerseyNumber: 7, position: "Winger", age: 22, nationality: "England", flag: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", status: "Active" },
  { id: "p10", name: "Gabriel Martinelli", jerseyNumber: 11, position: "Winger", age: 22, nationality: "Brazil", flag: "\uD83C\uDDE7\uD83C\uDDF7", status: "Active" },
  { id: "p11", name: "Kai Havertz", jerseyNumber: 29, position: "Forward", age: 25, nationality: "Germany", flag: "\uD83C\uDDE9\uD83C\uDDEA", status: "Active" },
  { id: "p12", name: "Leandro Trossard", jerseyNumber: 19, position: "Forward", age: 29, nationality: "Belgium", flag: "\uD83C\uDDE7\uD83C\uDDEA", status: "Suspended" },
  { id: "p13", name: "Jurrien Timber", jerseyNumber: 12, position: "Defender", age: 23, nationality: "Netherlands", flag: "\uD83C\uDDF3\uD83C\uDDF1", status: "Active" },
  { id: "p14", name: "Fabio Vieira", jerseyNumber: 21, position: "Midfielder", age: 24, nationality: "Portugal", flag: "\uD83C\uDDF5\uD83C\uDDF9", status: "Injured" },
  { id: "p15", name: "Eddie Nketiah", jerseyNumber: 14, position: "Forward", age: 25, nationality: "England", flag: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", status: "Active" },
];

const mockStaff: StaffMember[] = [
  { id: "s1", name: "Mikel Arteta", role: "Head Coach", email: "m.arteta@arsenal.com", phone: "+44 20 7619 5001" },
  { id: "s2", name: "Albert Stuivenberg", role: "Assistant Coach", email: "a.stuivenberg@arsenal.com", phone: "+44 20 7619 5002" },
  { id: "s3", name: "Julen Masach", role: "Fitness Coach", email: "j.masach@arsenal.com", phone: "+44 20 7619 5003" },
  { id: "s4", name: "Ben Knapper", role: "Analyst", email: "b.knapper@arsenal.com", phone: "+44 20 7619 5004" },
  { id: "s5", name: "Inaki Cana", role: "Goalkeeper Coach", email: "i.cana@arsenal.com", phone: "+44 20 7619 5005" },
  { id: "s6", name: "Gary O'Driscoll", role: "Physio", email: "g.odriscoll@arsenal.com", phone: "+44 20 7619 5006" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const mockScheduleWeek1: Record<string, ScheduleEvent[]> = {
  Mon: [
    { id: "e1", title: "Morning Training", type: "training", time: "09:00" },
    { id: "e2", title: "Video Analysis", type: "analysis", time: "14:00" },
  ],
  Tue: [
    { id: "e3", title: "Tactical Session", type: "training", time: "10:00" },
  ],
  Wed: [
    { id: "e4", title: "vs Chelsea (H)", type: "match", time: "20:00" },
  ],
  Thu: [
    { id: "e5", title: "Recovery Day", type: "rest", time: "All Day" },
  ],
  Fri: [
    { id: "e6", title: "Light Training", type: "training", time: "10:00" },
    { id: "e7", title: "Opposition Analysis", type: "analysis", time: "15:00" },
  ],
  Sat: [
    { id: "e8", title: "Match Day -1 Prep", type: "training", time: "11:00" },
  ],
  Sun: [
    { id: "e9", title: "vs Man City (A)", type: "match", time: "16:30" },
  ],
};

const mockScheduleWeek2: Record<string, ScheduleEvent[]> = {
  Mon: [
    { id: "e10", title: "Recovery Session", type: "rest", time: "All Day" },
  ],
  Tue: [
    { id: "e11", title: "Team Training", type: "training", time: "10:00" },
    { id: "e12", title: "Set Piece Analysis", type: "analysis", time: "14:30" },
  ],
  Wed: [
    { id: "e13", title: "Fitness Testing", type: "training", time: "09:00" },
  ],
  Thu: [
    { id: "e14", title: "vs Bayern (H) - UCL", type: "match", time: "21:00" },
  ],
  Fri: [
    { id: "e15", title: "Rest Day", type: "rest", time: "All Day" },
  ],
  Sat: [
    { id: "e16", title: "Pre-Match Training", type: "training", time: "10:30" },
    { id: "e17", title: "Match Prep Review", type: "analysis", time: "16:00" },
  ],
  Sun: [
    { id: "e18", title: "vs Liverpool (H)", type: "match", time: "14:00" },
  ],
};

const mockTrainingPlans: TrainingPlan[] = [
  {
    id: "tp1",
    title: "Pre-Season Fitness",
    description: "High-intensity conditioning program focusing on aerobic capacity, sprint endurance, and injury prevention protocols.",
    duration: "6 weeks",
    assignedPlayers: 15,
    completion: 100,
    status: "Completed",
  },
  {
    id: "tp2",
    title: "Match Day -1",
    description: "Light tactical walkthrough with set-piece rehearsal, team shape review, and activation exercises.",
    duration: "90 min",
    assignedPlayers: 11,
    completion: 65,
    status: "Active",
  },
  {
    id: "tp3",
    title: "Recovery Session",
    description: "Post-match recovery including ice baths, light stretching, massage therapy, and nutritional recovery protocols.",
    duration: "60 min",
    assignedPlayers: 15,
    completion: 40,
    status: "Active",
  },
  {
    id: "tp4",
    title: "Technical Drills",
    description: "Individual technical development sessions covering passing accuracy, first touch, and finishing under pressure.",
    duration: "2 weeks",
    assignedPlayers: 8,
    completion: 0,
    status: "Upcoming",
  },
];

const mockAnnouncements: Announcement[] = [
  {
    id: "a1",
    author: "Mikel Arteta",
    date: "2025-01-15",
    title: "Squad Update: Chelsea Match",
    message: "Zinchenko and Vieira have been ruled out for Saturday's match. Please review the updated squad list and tactical adjustments shared in the Files section.",
    pinned: true,
  },
  {
    id: "a2",
    author: "Ben Knapper",
    date: "2025-01-14",
    title: "New Analysis Software Rollout",
    message: "We are transitioning to the new video analysis platform next week. All coaching staff must complete the training module by Friday.",
    pinned: true,
  },
  {
    id: "a3",
    author: "Julen Masach",
    date: "2025-01-13",
    title: "Fitness Testing Schedule",
    message: "Mandatory fitness testing for all first-team players scheduled for Wednesday 9 AM. Please ensure adequate rest and hydration beforehand.",
    pinned: false,
  },
  {
    id: "a4",
    author: "Albert Stuivenberg",
    date: "2025-01-12",
    title: "Set Piece Review Session",
    message: "Defensive and attacking set piece review scheduled for Thursday afternoon. New corner routines will be introduced based on Chelsea's vulnerabilities.",
    pinned: false,
  },
  {
    id: "a5",
    author: "Gary O'Driscoll",
    date: "2025-01-11",
    title: "Medical Update: Return to Training",
    message: "Timber has been cleared for full contact training. Zinchenko progressing well but requires another 2 weeks of rehabilitation.",
    pinned: false,
  },
];

const mockFiles: FileRecord[] = [
  { id: "f1", filename: "Arsenal_Playbook_2025.pdf", type: "pdf", size: "4.2 MB", uploadedBy: "Mikel Arteta", date: "2025-01-10", folder: "Playbooks" },
  { id: "f2", filename: "Chelsea_Opposition_Report.pdf", type: "pdf", size: "2.8 MB", uploadedBy: "Ben Knapper", date: "2025-01-14", folder: "Scouting" },
  { id: "f3", filename: "Tactical_Formation_4231.pptx", type: "ppt", size: "8.5 MB", uploadedBy: "Albert Stuivenberg", date: "2025-01-12", folder: "Tactics" },
  { id: "f4", filename: "Set_Piece_Routines.pptx", type: "ppt", size: "5.1 MB", uploadedBy: "Mikel Arteta", date: "2025-01-09", folder: "Tactics" },
  { id: "f5", filename: "Highlights_vs_Liverpool.mp4", type: "video", size: "245 MB", uploadedBy: "Ben Knapper", date: "2025-01-08", folder: "Videos" },
  { id: "f6", filename: "Pressing_Triggers_Compilation.mp4", type: "video", size: "180 MB", uploadedBy: "Ben Knapper", date: "2025-01-07", folder: "Videos" },
  { id: "f7", filename: "Fitness_Report_Jan_2025.pdf", type: "pdf", size: "1.3 MB", uploadedBy: "Julen Masach", date: "2025-01-13", folder: "Medical" },
  { id: "f8", filename: "Season_Review_Midpoint.pptx", type: "ppt", size: "12.4 MB", uploadedBy: "Mikel Arteta", date: "2025-01-11", folder: "Reviews" },
];

const permissionRoles = ["Coach", "Analyst", "Athlete", "Scout"] as const;
const permissionTypes = [
  "View videos",
  "Upload",
  "Edit tactics",
  "Manage roster",
  "Export reports",
] as const;

const defaultPermissions: Record<string, Record<string, boolean>> = {
  Coach: { "View videos": true, Upload: true, "Edit tactics": true, "Manage roster": true, "Export reports": true },
  Analyst: { "View videos": true, Upload: true, "Edit tactics": true, "Manage roster": false, "Export reports": true },
  Athlete: { "View videos": true, Upload: false, "Edit tactics": false, "Manage roster": false, "Export reports": false },
  Scout: { "View videos": true, Upload: true, "Edit tactics": false, "Manage roster": false, "Export reports": true },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPositionColor(position: string): string {
  const pos = position.toLowerCase();
  if (pos.includes("goalkeeper")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (pos.includes("defender")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (pos.includes("midfielder")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (pos.includes("winger")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  if (pos.includes("forward") || pos.includes("striker")) return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Active":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Injured":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Suspended":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getEventColor(type: ScheduleEvent["type"]): string {
  switch (type) {
    case "match":
      return "bg-red-500/20 text-red-300 border-l-red-500";
    case "training":
      return "bg-blue-500/20 text-blue-300 border-l-blue-500";
    case "rest":
      return "bg-gray-500/20 text-gray-300 border-l-gray-500";
    case "analysis":
      return "bg-emerald-500/20 text-emerald-300 border-l-emerald-500";
    default:
      return "bg-gray-500/20 text-gray-300 border-l-gray-500";
  }
}

function getTrainingStatusColor(status: string): string {
  switch (status) {
    case "Active":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Completed":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Upcoming":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getFileIcon(type: FileRecord["type"]) {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-400" />;
    case "ppt":
      return <Presentation className="h-5 w-5 text-orange-400" />;
    case "video":
      return <Video className="h-5 w-5 text-blue-400" />;
    default:
      return <FileText className="h-5 w-5 text-gray-400" />;
  }
}

function getPositionCategory(position: string): string {
  const pos = position.toLowerCase();
  if (pos.includes("goalkeeper")) return "GK";
  if (pos.includes("defender")) return "DEF";
  if (pos.includes("midfielder")) return "MID";
  if (pos.includes("winger")) return "WNG";
  if (pos.includes("forward") || pos.includes("striker")) return "FWD";
  return "OTH";
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [scheduleWeek, setScheduleWeek] = useState<1 | 2>(1);
  const [pinnedFilter, setPinnedFilter] = useState(false);

  // Filtered players
  const filteredPlayers = mockPlayers.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      p.jerseyNumber.toString().includes(q)
    );
  });

  // Roster summary
  const totalPlayers = mockPlayers.length;
  const averageAge = Math.round(mockPlayers.reduce((sum, p) => sum + p.age, 0) / totalPlayers * 10) / 10;
  const positionsBreakdown = mockPlayers.reduce<Record<string, number>>((acc, p) => {
    const cat = getPositionCategory(p.position);
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const currentSchedule = scheduleWeek === 1 ? mockScheduleWeek1 : mockScheduleWeek2;

  function togglePermission(role: string, perm: string) {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm],
      },
    }));
  }

  function toggleSelectMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* ---------------------------------------------------------------- */}
        {/* Page Header                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
            <p className="text-sm text-muted-foreground">Arsenal FC</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setShowAddMember(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Roster
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Tabs                                                             */}
        {/* ---------------------------------------------------------------- */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="roster">
              <Users className="mr-1.5 h-4 w-4" />
              Roster
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Shield className="mr-1.5 h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="mr-1.5 h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="training">
              <CheckSquare className="mr-1.5 h-4 w-4" />
              Training Plans
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="files">
              <FolderOpen className="mr-1.5 h-4 w-4" />
              Files
            </TabsTrigger>
          </TabsList>

          {/* ============================================================== */}
          {/* ROSTER TAB                                                     */}
          {/* ============================================================== */}
          <TabsContent value="roster" className="space-y-4">
            {/* Summary Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalPlayers}</p>
                    <p className="text-xs text-muted-foreground">Total Players</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{averageAge}</p>
                    <p className="text-xs text-muted-foreground">Average Age</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-2 p-4">
                  {Object.entries(positionsBreakdown).map(([pos, count]) => (
                    <Badge key={pos} variant="secondary" className="text-xs">
                      {pos}: {count}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Roster Table */}
            <Card>
              <ScrollArea className="w-full">
                <div className="min-w-[900px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Player</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Position</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Age</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nationality</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((player) => (
                        <tr
                          key={player.id}
                          className="border-b border-border/50 transition-colors hover:bg-muted/30"
                        >
                          {/* Player Name + Avatar */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedMembers.includes(player.id)}
                                onCheckedChange={() => toggleSelectMember(player.id)}
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarFallback
                                  className={cn(
                                    "text-xs font-semibold",
                                    getPositionColor(player.position)
                                  )}
                                >
                                  {getInitials(player.name)}
                                </AvatarFallback>
                              </Avatar>
                              <button className="text-sm font-medium hover:text-emerald-400 hover:underline transition-colors text-left">
                                {player.name}
                              </button>
                            </div>
                          </td>
                          {/* Jersey Number */}
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold">{player.jerseyNumber}</span>
                          </td>
                          {/* Position */}
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getPositionColor(player.position))}
                            >
                              {player.position}
                            </Badge>
                          </td>
                          {/* Age */}
                          <td className="px-4 py-3 text-center">{player.age}</td>
                          {/* Nationality */}
                          <td className="px-4 py-3">
                            <span className="mr-1.5">{player.flag}</span>
                            {player.nationality}
                          </td>
                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getStatusColor(player.status))}
                            >
                              {player.status}
                            </Badge>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="View Stats">
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300"
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredPlayers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            No players match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </Card>

            {/* Add Player Dialog Placeholder */}
            {showAddMember && (
              <Card className="border-dashed border-2 border-emerald-500/30">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <UserPlus className="h-12 w-12 text-emerald-500/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-1">Add Player Dialog</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Player creation form would appear here with fields for name, position, nationality, jersey number, and more.
                  </p>
                  <Button variant="outline" onClick={() => setShowAddMember(false)}>
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============================================================== */}
          {/* STAFF TAB                                                      */}
          {/* ============================================================== */}
          <TabsContent value="staff" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockStaff.map((staff) => (
                <Card key={staff.id} className="transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-16 w-16 mb-3">
                        <AvatarFallback className="bg-blue-600/20 text-blue-400 text-lg font-bold">
                          {getInitials(staff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-base">{staff.name}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {staff.role}
                      </Badge>

                      <Separator className="my-4 w-full" />

                      <div className="w-full space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{staff.phone}</span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* SCHEDULE TAB                                                   */}
          {/* ============================================================== */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={scheduleWeek === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScheduleWeek(1)}
                >
                  Week 1
                </Button>
                <Button
                  variant={scheduleWeek === 2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScheduleWeek(2)}
                >
                  Week 2
                </Button>
              </div>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-red-500/40" /> Match
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-blue-500/40" /> Training
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-gray-500/40" /> Rest Day
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-emerald-500/40" /> Analysis
              </span>
            </div>

            {/* Weekly Calendar Grid */}
            <Card>
              <CardContent className="p-4">
                <ScrollArea className="w-full">
                  <div className="grid min-w-[700px] grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <div key={day} className="space-y-2">
                        <div className="rounded-md bg-muted/50 px-3 py-2 text-center text-sm font-semibold">
                          {day}
                        </div>
                        <div className="min-h-[120px] space-y-1.5">
                          {(currentSchedule[day] || []).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                "rounded-md border-l-2 px-2 py-1.5 text-xs",
                                getEventColor(event.type)
                              )}
                            >
                              <p className="font-medium leading-tight">{event.title}</p>
                              <p className="mt-0.5 opacity-70">{event.time}</p>
                            </div>
                          ))}
                          {(!currentSchedule[day] || currentSchedule[day].length === 0) && (
                            <div className="flex h-[120px] items-center justify-center text-xs text-muted-foreground/50">
                              No events
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================== */}
          {/* TRAINING PLANS TAB                                             */}
          {/* ============================================================== */}
          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {mockTrainingPlans.map((plan) => (
                <Card key={plan.id} className="transition-all hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{plan.title}</CardTitle>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getTrainingStatusColor(plan.status))}
                      >
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {plan.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {plan.assignedPlayers} players
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-semibold">{plan.completion}%</span>
                      </div>
                      <Progress value={plan.completion} />
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* COMMUNICATION TAB                                              */}
          {/* ============================================================== */}
          <TabsContent value="communication" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Announcements</h2>
                <button
                  onClick={() => setPinnedFilter(!pinnedFilter)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    pinnedFilter
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <Pin className="h-3 w-3" />
                  Pinned Only
                </button>
              </div>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </div>

            <div className="space-y-3">
              {mockAnnouncements
                .filter((a) => !pinnedFilter || a.pinned)
                .map((announcement) => (
                  <Card key={announcement.id} className={cn(announcement.pinned && "border-amber-500/30")}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 mt-0.5">
                          <AvatarFallback className="bg-muted text-xs font-semibold">
                            {getInitials(announcement.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{announcement.title}</h3>
                            {announcement.pinned && (
                              <Pin className="h-3.5 w-3.5 text-amber-400" />
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{announcement.author}</span>
                            <span>-</span>
                            <span>{announcement.date}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {announcement.message}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* FILES TAB                                                      */}
          {/* ============================================================== */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search files..." className="pl-9" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                  {[...new Set(mockFiles.map((f) => f.folder))].length} folders
                </div>
              </div>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </div>

            {/* Folder Tags */}
            <div className="flex flex-wrap gap-2">
              {[...new Set(mockFiles.map((f) => f.folder))].map((folder) => (
                <Badge key={folder} variant="secondary" className="cursor-pointer hover:bg-muted/80">
                  <FolderOpen className="mr-1 h-3 w-3" />
                  {folder}
                </Badge>
              ))}
            </div>

            {/* Files Table */}
            <Card>
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">File Name</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Folder</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Size</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Uploaded By</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFiles.map((file) => (
                        <tr
                          key={file.id}
                          className="border-b border-border/50 transition-colors hover:bg-muted/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.type)}
                              <span className="font-medium hover:text-emerald-400 cursor-pointer transition-colors">
                                {file.filename}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-xs">
                              {file.folder}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground">
                            {file.size}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{file.uploadedBy}</td>
                          <td className="px-4 py-3 text-muted-foreground">{file.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ================================================================ */}
        {/* Permission Management                                            */}
        {/* ================================================================ */}
        <Separator />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-base">Permission Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[600px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Permission
                      </th>
                      {permissionRoles.map((role) => (
                        <th
                          key={role}
                          className="px-4 py-3 text-center font-medium text-muted-foreground"
                        >
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionTypes.map((perm) => (
                      <tr key={perm} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{perm}</td>
                        {permissionRoles.map((role) => (
                          <td key={role} className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={permissions[role]?.[perm] ?? false}
                                onCheckedChange={() => togglePermission(role, perm)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
