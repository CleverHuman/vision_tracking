"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { useVideos, usePlayers, useMatches } from "@/hooks";
import { useAuth } from "@/hooks/use-auth";
import {
  activityItems as mockActivities,
  calendarEvents as mockCalendarEvents,
} from "@/data/mock-data";
import type { ActivityItem, CalendarEvent, Player, Video } from "@/types";
import { formatRelativeTime, formatDate, getInitials } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Video as VideoIcon,
  Radio,
  TrendingUp,
  Calendar,
  Upload,
  Tv,
  Film,
  Users,
  Play,
  ArrowUpRight,
  Clock,
  FileText,
  Share2,
  Scissors,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// ---------------------------------------------------------------------------
// Inline chart data
// ---------------------------------------------------------------------------

const performanceTrendsData = [
  { week: "Week 1", goals: 2, assists: 1, passAccuracy: 84 },
  { week: "Week 2", goals: 1, assists: 3, passAccuracy: 87 },
  { week: "Week 3", goals: 3, assists: 2, passAccuracy: 89 },
  { week: "Week 4", goals: 0, assists: 1, passAccuracy: 83 },
  { week: "Week 5", goals: 4, assists: 2, passAccuracy: 91 },
  { week: "Week 6", goals: 2, assists: 4, passAccuracy: 88 },
  { week: "Week 7", goals: 2, assists: 2, passAccuracy: 90 },
  { week: "Week 8", goals: 3, assists: 3, passAccuracy: 92 },
];

// ---------------------------------------------------------------------------
// Activity icon resolver
// ---------------------------------------------------------------------------

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "upload":
      return <Upload className="h-4 w-4 text-emerald-400" />;
    case "analysis":
      return <Sparkles className="h-4 w-4 text-purple-400" />;
    case "highlight":
      return <Scissors className="h-4 w-4 text-amber-400" />;
    case "annotation":
      return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case "report":
      return <FileText className="h-4 w-4 text-cyan-400" />;
    case "share":
      return <Share2 className="h-4 w-4 text-pink-400" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

// ---------------------------------------------------------------------------
// Analysis status badge
// ---------------------------------------------------------------------------

function statusBadge(status: Video["analysisStatus"]) {
  switch (status) {
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "processing":
      return <Badge variant="processing">Processing</Badge>;
    case "unprocessed":
      return <Badge variant="secondary">Unprocessed</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Calendar event type badge
// ---------------------------------------------------------------------------

function calendarTypeBadge(type: CalendarEvent["type"]) {
  switch (type) {
    case "match":
      return (
        <Badge className="border-transparent bg-red-500/20 text-red-400">
          Match
        </Badge>
      );
    case "training":
      return <Badge variant="info">Training</Badge>;
    case "analysis":
      return <Badge variant="success">Analysis</Badge>;
    case "meeting":
      return <Badge variant="secondary">Meeting</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTopPlayers(players: Player[], count: number) {
  return [...players]
    .sort((a, b) => {
      const avgA =
        a.recentForm.reduce((s, v) => s + v, 0) / a.recentForm.length;
      const avgB =
        b.recentForm.reduce((s, v) => s + v, 0) / b.recentForm.length;
      return avgB - avgA;
    })
    .slice(0, count);
}

function playerRating(player: Player) {
  return (
    player.recentForm.reduce((s, v) => s + v, 0) / player.recentForm.length
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: allVideos } = useVideos({}, 50);
  const { data: allMatches } = useMatches({}, 50);
  const { data: allPlayers } = usePlayers({}, 50);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const videosThisWeek = allVideos.filter((v) => {
    const uploadDate = new Date(v.uploadDate);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return uploadDate >= weekAgo;
  });

  const activeSessions = allVideos.filter(
    (v) => v.analysisStatus === "processing"
  ).length;

  const soccerMatches = allMatches.filter((m) => m.sport === "soccer");
  const teamPerformance = soccerMatches.length > 0
    ? Math.round(
        (soccerMatches.filter((m) => m.result === "win").length /
          soccerMatches.length) *
          100
      )
    : 0;

  // Keep mock data for calendar/activity (no backend endpoints)
  const upcomingMatches = mockCalendarEvents.filter(
    (e) => e.type === "match" && new Date(e.date) > new Date()
  );

  const upcomingEvents = mockCalendarEvents
    .filter((e) => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentActivities = mockActivities.slice(0, 6);

  const topPlayers = allPlayers.length > 0 ? getTopPlayers(allPlayers, 5) : [];

  const recentVideos = [...allVideos]
    .sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    )
    .slice(0, 4);

  const roleLabelMap: Record<string, string> = {
    coach: "Head Coach",
    analyst: "Analyst",
    athlete: "Athlete",
    scout: "Scout",
    team_manager: "Team Manager",
  };

  const userName = user?.name || "User";

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* ---------------------------------------------------------------- */}
        {/* 1. Welcome Header                                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          <Badge variant="sport" className="w-fit">
            {roleLabelMap[user?.role || "coach"] ?? user?.role}
          </Badge>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 2. Quick Action Buttons                                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Link href="/videos?action=upload">
              <Upload className="h-4 w-4" />
              Upload Video
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/live">
              <Tv className="h-4 w-4" />
              Start Live Analysis
            </Link>
          </Button>
          <Button asChild className="bg-purple-600 text-white hover:bg-purple-700">
            <Link href="/highlights?action=create">
              <Film className="h-4 w-4" />
              Create Highlight Reel
            </Link>
          </Button>
          <Button asChild variant="accent">
            <Link href="/players?action=compare">
              <Users className="h-4 w-4" />
              Compare Players
            </Link>
          </Button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 3. Stats Cards                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Videos Analyzed This Week */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Videos Analyzed This Week
              </CardTitle>
              <VideoIcon className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{videosThisWeek.length}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12% from last week</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Tracking Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tracking Sessions
              </CardTitle>
              <Radio className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeSessions}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          {/* Team Performance Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Performance Score
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{teamPerformance}%</div>
              <Progress
                value={teamPerformance}
                className="mt-2 h-1.5 bg-emerald-500/20 [&>[data-state]]:bg-emerald-500"
              />
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                <ArrowUpRight className="h-3 w-3" />
                <span>Win rate this season</span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Matches
              </CardTitle>
              <Calendar className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingMatches.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Scheduled this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 4. Two-Column Layout                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* --- Left column (2/3) --- */}
          <div className="space-y-6 lg:col-span-2">
            {/* Performance Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceTrendsData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradGoals"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradAssists"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradAccuracy"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#a855f7"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a855f7"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="goals"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#gradGoals)"
                        name="Goals"
                      />
                      <Area
                        type="monotone"
                        dataKey="assists"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#gradAssists)"
                        name="Assists"
                      />
                      <Area
                        type="monotone"
                        dataKey="passAccuracy"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fill="url(#gradAccuracy)"
                        name="Pass Accuracy"
                        yAxisId={1}
                        hide
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Goals
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Assists
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm leading-snug">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span className="text-border">|</span>
                          <span>{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- Right column (1/3) --- */}
          <div className="space-y-6">
            {/* Top Players Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPlayers.map((player, idx) => {
                    const rating = playerRating(player);
                    const ratingPct = (rating / 10) * 100;

                    return (
                      <div key={player.id} className="flex items-center gap-3">
                        <span className="w-4 text-xs font-semibold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback className="text-[10px] bg-emerald-600/20 text-emerald-400">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {player.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {player.position}
                          </p>
                        </div>
                        <div className="w-20 space-y-0.5">
                          <div className="text-right text-xs font-semibold text-emerald-400">
                            {rating.toFixed(1)}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/20">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${ratingPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const dayNum = eventDate.getDate();
                    const monthShort = eventDate.toLocaleDateString("en-US", {
                      month: "short",
                    });

                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                      >
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
                          <span className="text-[10px] font-medium uppercase leading-none text-muted-foreground">
                            {monthShort}
                          </span>
                          <span className="text-base font-bold leading-tight">
                            {dayNum}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="truncate text-sm font-medium">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {event.time}
                            </span>
                            {calendarTypeBadge(event.type)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 5. Recent Videos Row                                             */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Videos</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/videos">
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentVideos.map((video) => (
              <Card
                key={video.id}
                className="w-[280px] shrink-0 overflow-hidden"
              >
                {/* Thumbnail placeholder */}
                <div className="relative flex h-[158px] items-center justify-center bg-muted">
                  <Play className="h-10 w-10 text-muted-foreground/50" />
                  <div className="absolute bottom-2 right-2">
                    {statusBadge(video.analysisStatus)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="line-clamp-1 text-sm font-medium">
                    {video.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(video.uploadDate)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
