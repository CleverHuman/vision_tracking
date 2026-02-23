"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Plus,
  Calendar,
  Eye,
  Edit,
  Download,
  Share2,
  Trash2,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Lightbulb,
  Clock,
  User,
  Send,
  FileDown,
  Presentation,
  Video,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportType =
  | "pre-game"
  | "post-match"
  | "player"
  | "team"
  | "custom";

type ReportStatus = "draft" | "published";

interface MockReport {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockReports: MockReport[] = [
  {
    id: "rpt-001",
    title: "Arsenal vs Chelsea - Post Match Analysis",
    type: "post-match",
    status: "published",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-16",
    author: "James Carter",
    tags: ["Premier League", "Tactical", "Key Moments"],
  },
  {
    id: "rpt-002",
    title: "Liverpool Scouting Report - Upcoming Fixture",
    type: "pre-game",
    status: "published",
    createdAt: "2025-01-18",
    updatedAt: "2025-01-19",
    author: "Sarah Mitchell",
    tags: ["Scouting", "Opposition", "Set Pieces"],
  },
  {
    id: "rpt-003",
    title: "Marcus Rashford - Monthly Performance Review",
    type: "player",
    status: "draft",
    createdAt: "2025-01-20",
    updatedAt: "2025-01-21",
    author: "James Carter",
    tags: ["Player Analysis", "Form", "Fitness"],
  },
  {
    id: "rpt-004",
    title: "Team Defensive Structure - Season Overview",
    type: "team",
    status: "published",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-14",
    author: "David Okonkwo",
    tags: ["Defense", "Season Review", "Trends"],
  },
  {
    id: "rpt-005",
    title: "Man City Pre-Game Tactical Breakdown",
    type: "pre-game",
    status: "draft",
    createdAt: "2025-01-22",
    updatedAt: "2025-01-22",
    author: "Sarah Mitchell",
    tags: ["Scouting", "Pressing", "Build-Up"],
  },
  {
    id: "rpt-006",
    title: "Brighton vs Arsenal - Post Match Review",
    type: "post-match",
    status: "published",
    createdAt: "2025-01-12",
    updatedAt: "2025-01-13",
    author: "James Carter",
    tags: ["Premier League", "xG Analysis", "Highlights"],
  },
  {
    id: "rpt-007",
    title: "Bukayo Saka - Injury Return Assessment",
    type: "player",
    status: "published",
    createdAt: "2025-01-08",
    updatedAt: "2025-01-10",
    author: "David Okonkwo",
    tags: ["Player Analysis", "Fitness", "Recovery"],
  },
  {
    id: "rpt-008",
    title: "Attacking Patterns - Custom Deep Dive",
    type: "custom",
    status: "draft",
    createdAt: "2025-01-23",
    updatedAt: "2025-01-23",
    author: "Sarah Mitchell",
    tags: ["Custom", "Attack", "Progressive Passing"],
  },
  {
    id: "rpt-009",
    title: "Team Pressing Efficiency - Q4 Report",
    type: "team",
    status: "published",
    createdAt: "2025-01-05",
    updatedAt: "2025-01-07",
    author: "James Carter",
    tags: ["Pressing", "Quarterly", "Metrics"],
  },
  {
    id: "rpt-010",
    title: "Tottenham Scouting - Cup Fixture Prep",
    type: "pre-game",
    status: "draft",
    createdAt: "2025-01-24",
    updatedAt: "2025-01-24",
    author: "David Okonkwo",
    tags: ["FA Cup", "Scouting", "Weaknesses"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const reportTypeConfig: Record<
  ReportType,
  { label: string; color: string; bgColor: string }
> = {
  "pre-game": {
    label: "Pre-Game Scouting",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  "post-match": {
    label: "Post-Match Analysis",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  player: {
    label: "Player Report",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  team: {
    label: "Team Performance",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  custom: {
    label: "Custom",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
  },
};

function getReportIcon(type: ReportType) {
  const config = reportTypeConfig[type];
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        config.bgColor
      )}
    >
      <FileText className={cn("h-5 w-5", config.color)} />
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Metric options for the builder
// ---------------------------------------------------------------------------

const metricOptions = [
  { id: "possession", label: "Possession" },
  { id: "passing", label: "Passing" },
  { id: "shooting", label: "Shooting" },
  { id: "defense", label: "Defense" },
  { id: "physical", label: "Physical" },
  { id: "set-pieces", label: "Set Pieces" },
];

// ---------------------------------------------------------------------------
// Template cards
// ---------------------------------------------------------------------------

const templates = [
  {
    id: "match-report",
    title: "Match Report",
    description: "Full post-match or pre-game analysis template",
    icon: FileText,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  {
    id: "player-scout",
    title: "Player Scout",
    description: "Individual player performance and scouting report",
    icon: User,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  {
    id: "season-review",
    title: "Season Review",
    description: "Comprehensive season or period performance overview",
    icon: BarChart3,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  {
    id: "custom-blank",
    title: "Custom Blank",
    description: "Start from scratch with a blank canvas",
    icon: Plus,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
];

// ---------------------------------------------------------------------------
// AI Insights
// ---------------------------------------------------------------------------

const aiInsights = [
  {
    id: "insight-1",
    text: "Pressing intensity has increased 15% over last 5 matches",
    detail: "PPDA dropped from 12.3 to 10.5 indicating higher pressing.",
  },
  {
    id: "insight-2",
    text: "Left flank is vulnerable - 60% of goals conceded from left side",
    detail: "Crosses from the left bypass midfield cover consistently.",
  },
  {
    id: "insight-3",
    text: "Set piece conversion rate improved to 12% this month",
    detail: "Up from 8% last month, mainly from corner routines.",
  },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "possession",
    "passing",
  ]);
  const [reportsList] = useState<MockReport[]>(mockReports);

  // Chart type toggles
  const [chartOptions, setChartOptions] = useState({
    bar: true,
    line: false,
    radar: false,
    table: true,
  });

  const [includeVideoClips, setIncludeVideoClips] = useState(false);
  const [comparePrevious, setComparePrevious] = useState(false);

  // Export scheduling
  const [scheduleFrequency, setScheduleFrequency] = useState<
    "weekly" | "monthly"
  >("weekly");

  // Filter reports by tab
  const filteredReports =
    activeTab === "all"
      ? reportsList
      : reportsList.filter((r) => r.type === activeTab);

  // Metric toggle handler
  function toggleMetric(metricId: string) {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((m) => m !== metricId)
        : [...prev, metricId]
    );
  }

  // Chart toggle handler
  function toggleChart(key: keyof typeof chartOptions) {
    setChartOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* ================================================================ */}
        {/* 1. Page Header                                                   */}
        {/* ================================================================ */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Reports &amp; Insights
            </h1>
            <p className="text-sm text-muted-foreground">
              Create, manage, and share analytical reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBuilder(false)}
            >
              <Calendar className="h-4 w-4" />
              Schedule Report
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setShowBuilder((v) => !v)}
            >
              <Plus className="h-4 w-4" />
              Create New Report
            </Button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 4. Report Builder Section (toggled)                              */}
        {/* ================================================================ */}
        {showBuilder && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Builder</CardTitle>
              <CardDescription>
                Configure and generate a new report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* --- Template Selection --- */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Select a Template
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {templates.map((tpl) => {
                    const Icon = tpl.icon;
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border/50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-lg",
                            tpl.bgColor
                          )}
                        >
                          <Icon className={cn("h-6 w-6", tpl.color)} />
                        </div>
                        <span className="text-sm font-medium">
                          {tpl.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tpl.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* --- Metric Selection --- */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Metrics to Include
                </h3>
                <div className="flex flex-wrap gap-4">
                  {metricOptions.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                      />
                      <Label
                        htmlFor={metric.id}
                        className="text-sm cursor-pointer"
                      >
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* --- Time Period & Comparison --- */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Time Period</h3>
                  <div className="flex items-center gap-2">
                    <Input type="date" className="w-auto" />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input type="date" className="w-auto" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Comparison</h3>
                  <button
                    onClick={() => setComparePrevious((v) => !v)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
                      comparePrevious
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border/50 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-3 w-3 rounded-full border-2 transition-colors",
                        comparePrevious
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-muted-foreground"
                      )}
                    />
                    Compare with previous period
                  </button>
                </div>
              </div>

              <Separator />

              {/* --- Chart Options & Video Clips --- */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Chart Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { key: "bar" as const, label: "Bar", icon: BarChart3 },
                        { key: "line" as const, label: "Line", icon: LineChart },
                        { key: "radar" as const, label: "Radar", icon: PieChart },
                        { key: "table" as const, label: "Table", icon: Table },
                      ] as const
                    ).map(({ key, label, icon: ChartIcon }) => (
                      <button
                        key={key}
                        onClick={() => toggleChart(key)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                          chartOptions[key]
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                            : "border-border/50 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <ChartIcon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Video Clips</h3>
                  <button
                    onClick={() => setIncludeVideoClips((v) => !v)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
                      includeVideoClips
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border/50 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <Video className="h-4 w-4" />
                    Include key moment clips
                    <div
                      className={cn(
                        "ml-2 h-3 w-3 rounded-full border-2 transition-colors",
                        includeVideoClips
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-muted-foreground"
                      )}
                    />
                  </button>
                </div>
              </div>

              <Separator />

              {/* --- Generate Button --- */}
              <div className="flex justify-end">
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================================================================ */}
        {/* 2. Report Type Tabs                                              */}
        {/* ================================================================ */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="pre-game">Pre-Game Scouting</TabsTrigger>
            <TabsTrigger value="post-match">Post-Match Analysis</TabsTrigger>
            <TabsTrigger value="player">Player Reports</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* ============================================================== */}
          {/* 3. Reports Grid                                                */}
          {/* ============================================================== */}
          <TabsContent value={activeTab} className="mt-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No reports found in this category.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredReports.map((report) => {
                  const config = reportTypeConfig[report.type];
                  return (
                    <Card key={report.id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          {getReportIcon(report.type)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="line-clamp-2 text-sm">
                              {report.title}
                            </CardTitle>
                            <Badge
                              className={cn(
                                "mt-1.5 border-transparent",
                                config.bgColor,
                                config.color
                              )}
                            >
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-3">
                        {/* Dates */}
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {formatDate(report.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            <span>Updated: {formatDate(report.updatedAt)}</span>
                          </div>
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{report.author}</span>
                        </div>

                        {/* Status badge */}
                        <div>
                          {report.status === "published" ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="warning">Draft</Badge>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {report.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Actions */}
                        <Separator />
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Export"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ================================================================ */}
        {/* 5. Export Options Panel                                          */}
        {/* ================================================================ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Options</CardTitle>
            <CardDescription>
              Choose format, sharing, and scheduling options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Format buttons */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Export Format</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start">
                    <FileDown className="h-4 w-4 text-red-400" />
                    PDF Document
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Presentation className="h-4 w-4 text-orange-400" />
                    PowerPoint
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Video className="h-4 w-4 text-blue-400" />
                    Video Format
                  </Button>
                </div>
              </div>

              {/* Share with team */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Share with Team Members
                </h3>
                <div className="space-y-2">
                  <Input placeholder="Search team members..." />
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" />
                      James Carter
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" />
                      Sarah Mitchell
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Schedule automated */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Schedule Automated
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setScheduleFrequency("weekly")}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      scheduleFrequency === "weekly"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border/50 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setScheduleFrequency("monthly")}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      scheduleFrequency === "monthly"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border/50 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Email recipients */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Email Recipients
                </h3>
                <div className="flex gap-2">
                  <Input placeholder="Enter email address..." className="flex-1" />
                  <Button size="icon" variant="outline">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Send className="h-3 w-3" />
                    coach@team.com
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Send className="h-3 w-3" />
                    analyst@team.com
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* 6. Recent Insights Widget                                        */}
        {/* ================================================================ */}
        <div>
          <h2 className="mb-4 text-base font-semibold">
            AI-Generated Insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiInsights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                      <Lightbulb className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        {insight.text}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {insight.detail}
                      </p>
                      <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                        View Details
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
