"use client";

import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { usePlayers } from "@/hooks";
import type { Player } from "@/types";
import { cn, getInitials } from "@/lib/utils";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  Search,
  Filter,
  Users,
  UserPlus,
  Download,
  GitCompare,
  ChevronRight,
  Star,
  Zap,
  Timer,
  Footprints,
  Target,
  ArrowLeft,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ViewMode = "roster" | "detail";

function getPositionCategory(position: string): string {
  const pos = position.toLowerCase();
  if (pos.includes("forward") || pos.includes("wing") || pos.includes("striker")) return "Forward";
  if (pos.includes("midfielder") || pos.includes("midfield")) return "Midfielder";
  if (pos.includes("back") || pos.includes("defender") || pos.includes("centre back")) return "Defender";
  if (pos.includes("goalkeeper") || pos.includes("keeper")) return "Goalkeeper";
  return "Other";
}

function getPositionColor(position: string): string {
  const cat = getPositionCategory(position);
  switch (cat) {
    case "Forward":
      return "bg-red-500/20 text-red-400";
    case "Midfielder":
      return "bg-blue-500/20 text-blue-400";
    case "Defender":
      return "bg-emerald-500/20 text-emerald-400";
    case "Goalkeeper":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

function getAvatarBg(position: string): string {
  const cat = getPositionCategory(position);
  switch (cat) {
    case "Forward":
      return "bg-red-600/20 text-red-400";
    case "Midfielder":
      return "bg-blue-600/20 text-blue-400";
    case "Defender":
      return "bg-emerald-600/20 text-emerald-400";
    case "Goalkeeper":
      return "bg-yellow-600/20 text-yellow-400";
    default:
      return "bg-gray-600/20 text-gray-400";
  }
}

function playerAvgRating(player: Player): number {
  if (!player.recentForm.length) return 0;
  return player.recentForm.reduce((s, v) => s + v, 0) / player.recentForm.length;
}

function getNationalityFlag(nationality: string): string {
  const flags: Record<string, string> = {
    England: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F",
    Norway: "\uD83C\uDDF3\uD83C\uDDF4",
    France: "\uD83C\uDDEB\uD83C\uDDF7",
    Brazil: "\uD83C\uDDE7\uD83C\uDDF7",
    Germany: "\uD83C\uDDE9\uD83C\uDDEA",
    Spain: "\uD83C\uDDEA\uD83C\uDDF8",
    Netherlands: "\uD83C\uDDF3\uD83C\uDDF1",
    Belgium: "\uD83C\uDDE7\uD83C\uDDEA",
    Ghana: "\uD83C\uDDEC\uD83C\uDDED",
    Egypt: "\uD83C\uDDEA\uD83C\uDDEC",
    "South Korea": "\uD83C\uDDF0\uD83C\uDDF7",
    "United States": "\uD83C\uDDFA\uD83C\uDDF8",
    Italy: "\uD83C\uDDEE\uD83C\uDDF9",
  };
  return flags[nationality] || "\uD83C\uDFF3\uFE0F";
}

/** Generate mock radar data for a player */
function getRadarData(player: Player) {
  const seed = player.id.charCodeAt(player.id.length - 1);
  const base = (v: number) => Math.min(95, Math.max(40, v));
  return [
    { attribute: "Pace", value: base(65 + ((seed * 7) % 30)) },
    { attribute: "Shooting", value: base((player.stats.goals ?? 0) * 3 + 45) },
    { attribute: "Passing", value: base(player.stats.passAccuracy ?? 70) },
    { attribute: "Dribbling", value: base(60 + ((seed * 3) % 25)) },
    { attribute: "Defending", value: base((player.stats.tackles ?? 0) + (player.stats.interceptions ?? 0) + 30) },
    { attribute: "Physical", value: base(55 + ((seed * 5) % 30)) },
  ];
}

/** Generate mock performance trend for last 8 matches */
function getPerformanceTrend(player: Player) {
  const base = playerAvgRating(player);
  return Array.from({ length: 8 }, (_, i) => ({
    match: `M${i + 1}`,
    rating: Math.round((base + (Math.sin(i * 1.5) * 1.2 + (i % 3 === 0 ? 0.5 : -0.3))) * 10) / 10,
  }));
}

/** Generate mock recent matches */
function getRecentMatches(player: Player) {
  const opponents = ["Chelsea", "Man City", "Bayern Munich"];
  const results: Array<{ opponent: string; result: string; score: string; rating: number }> = [];
  player.recentForm.slice(0, 3).forEach((rating, i) => {
    const won = rating > 7.5;
    const draw = rating >= 7.0 && rating <= 7.5;
    results.push({
      opponent: opponents[i % opponents.length],
      result: won ? "W" : draw ? "D" : "L",
      score: won ? "3-1" : draw ? "1-1" : "0-2",
      rating,
    });
  });
  return results;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function PlayersPage() {
  const [view, setView] = useState<ViewMode>("roster");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Name");
  const [comparisonPlayers, setComparisonPlayers] = useState<Player[]>([]);

  const { data: players, isLoading } = usePlayers({}, 50);

  // Filter only soccer players for this page
  const soccerPlayers = useMemo(() => (players ?? []).filter((p) => p.sport === "soccer"), [players]);

  // Filtered and sorted players
  const filteredPlayers = useMemo(() => {
    let result = [...soccerPlayers];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q)
      );
    }

    // Position filter
    if (positionFilter !== "All") {
      result = result.filter((p) => getPositionCategory(p.position) === positionFilter);
    }

    // Sort
    switch (sortBy) {
      case "Name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Rating":
        result.sort((a, b) => playerAvgRating(b) - playerAvgRating(a));
        break;
      case "Goals":
        result.sort((a, b) => (b.stats.goals ?? 0) - (a.stats.goals ?? 0));
        break;
      case "Assists":
        result.sort((a, b) => (b.stats.assists ?? 0) - (a.stats.assists ?? 0));
        break;
    }

    return result;
  }, [soccerPlayers, searchQuery, positionFilter, sortBy]);

  // Toggle comparison player selection
  function toggleComparison(player: Player) {
    setComparisonPlayers((prev) => {
      const exists = prev.find((p) => p.id === player.id);
      if (exists) return prev.filter((p) => p.id !== player.id);
      if (prev.length >= 2) return prev;
      return [...prev, player];
    });
  }

  function handleViewProfile(player: Player) {
    setSelectedPlayer(player);
    setView("detail");
  }

  function handleBackToRoster() {
    setView("roster");
    setSelectedPlayer(null);
  }

  const isComparing = comparisonPlayers.length === 2;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* ---------------------------------------------------------------- */}
        {/* 1. Page Header                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {view === "detail" && (
              <Button variant="ghost" size="icon" onClick={handleBackToRoster}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Player Performance</h1>
              <p className="text-sm text-muted-foreground">
                {view === "detail" && selectedPlayer
                  ? `${selectedPlayer.name} - ${selectedPlayer.position}`
                  : `${filteredPlayers.length} players`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              <UserPlus className="h-4 w-4" />
              Add Player
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export Reports
            </Button>
            <Button
              variant={isComparing ? "default" : "outline"}
              onClick={() => {
                if (isComparing) {
                  // Already comparing -- keep state
                } else {
                  setComparisonPlayers([]);
                }
              }}
              className={isComparing ? "bg-purple-600 text-white hover:bg-purple-700" : ""}
            >
              <GitCompare className="h-4 w-4" />
              Compare{isComparing ? ` (${comparisonPlayers.length})` : ""}
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 2. View Toggle                                                   */}
        {/* ---------------------------------------------------------------- */}
        {view === "roster" && !isComparing && (
          <>
            <Tabs defaultValue="roster" className="w-fit">
              <TabsList>
                <TabsTrigger value="roster" onClick={() => setView("roster")}>
                  <Users className="mr-1.5 h-4 w-4" />
                  Roster Grid
                </TabsTrigger>
                <TabsTrigger
                  value="detail"
                  onClick={() => {
                    if (filteredPlayers.length > 0) {
                      handleViewProfile(filteredPlayers[0]);
                    }
                  }}
                >
                  <ChevronRight className="mr-1.5 h-4 w-4" />
                  Individual Detail
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* -------------------------------------------------------------- */}
            {/* 3. Filters                                                     */}
            {/* -------------------------------------------------------------- */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Positions</SelectItem>
                  <SelectItem value="Forward">Forward</SelectItem>
                  <SelectItem value="Midfielder">Midfielder</SelectItem>
                  <SelectItem value="Defender">Defender</SelectItem>
                  <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Name">Name</SelectItem>
                  <SelectItem value="Rating">Rating</SelectItem>
                  <SelectItem value="Goals">Goals</SelectItem>
                  <SelectItem value="Assists">Assists</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* 4. COMPARISON MODE                                               */}
        {/* ---------------------------------------------------------------- */}
        {isComparing && <ComparisonView players={comparisonPlayers} onClear={() => setComparisonPlayers([])} />}

        {/* ---------------------------------------------------------------- */}
        {/* 4. ROSTER GRID VIEW                                              */}
        {/* ---------------------------------------------------------------- */}
        {view === "roster" && !isComparing && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlayers.map((player) => {
              const avgRating = playerAvgRating(player);
              const isSelected = comparisonPlayers.some((p) => p.id === player.id);

              return (
                <Card
                  key={player.id}
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer",
                    isSelected && "ring-2 ring-purple-500"
                  )}
                >
                  {/* Comparison checkbox overlay */}
                  <div
                    className="absolute top-3 left-3 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComparison(player);
                    }}
                  >
                    <div
                      className={cn(
                        "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer",
                        isSelected
                          ? "border-purple-500 bg-purple-500 text-white"
                          : "border-muted-foreground/40 hover:border-purple-400"
                      )}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Jersey number badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="font-bold text-sm">
                      #{player.jerseyNumber}
                    </Badge>
                  </div>

                  <CardContent className="pt-6 pb-4">
                    {/* Avatar */}
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-16 w-16 mb-3">
                        <AvatarFallback className={cn("text-lg font-bold", getAvatarBg(player.position))}>
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Player name */}
                      <h3 className="font-bold text-base">{player.name}</h3>

                      {/* Position and team */}
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className={cn("text-[10px]", getPositionColor(player.position))}>
                          {player.position}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{player.team}</p>

                      {/* Nationality */}
                      <p className="mt-1 text-sm">
                        {getNationalityFlag(player.nationality)} {player.nationality}
                      </p>
                    </div>

                    <Separator className="my-3" />

                    {/* Quick stats row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold">{player.stats.goals ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Goals</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{player.stats.assists ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Assists</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">{avgRating.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                      </div>
                    </div>

                    {/* Performance trend dots */}
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground mr-1">Form:</span>
                      {player.recentForm.map((val, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            val > 7 ? "bg-emerald-500" : val >= 5 ? "bg-amber-500" : "bg-red-500"
                          )}
                          title={`Match ${i + 1}: ${val}`}
                        />
                      ))}
                    </div>

                    {/* View Profile button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleViewProfile(player)}
                    >
                      View Profile
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* 5. INDIVIDUAL DETAIL VIEW                                        */}
        {/* ---------------------------------------------------------------- */}
        {view === "detail" && selectedPlayer && !isComparing && (
          <DetailView player={selectedPlayer} />
        )}
      </div>
    </AppLayout>
  );
}

// ===========================================================================
// Detail View Component
// ===========================================================================

function DetailView({ player }: { player: Player }) {
  const radarData = getRadarData(player);
  const trendData = getPerformanceTrend(player);
  const recentMatches = getRecentMatches(player);
  const avgRating = playerAvgRating(player);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ---- Left Column (1/3): Player Info ---- */}
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className={cn("text-2xl font-bold", getAvatarBg(player.position))}>
                  {getInitials(player.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{player.name}</h2>
                <Badge variant="secondary" className="font-bold">
                  #{player.jerseyNumber}
                </Badge>
              </div>

              <Badge className={cn("mt-2", getPositionColor(player.position))}>
                {player.position}
              </Badge>

              <p className="mt-1 text-sm text-muted-foreground">{player.team}</p>
              <p className="mt-1 text-sm">
                {getNationalityFlag(player.nationality)} {player.nationality}
              </p>

              <div className="mt-3 flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Physical Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Age</span>
                <span className="text-sm font-semibold">{player.age} years</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Height</span>
                <span className="text-sm font-semibold">{player.height}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weight</span>
                <span className="text-sm font-semibold">{player.weight}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Season stats table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Season Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Matches", value: player.stats.matchesPlayed, icon: Target },
                { label: "Minutes", value: player.stats.minutesPlayed.toLocaleString(), icon: Timer },
                { label: "Goals", value: player.stats.goals ?? 0, icon: Zap },
                { label: "Assists", value: player.stats.assists ?? 0, icon: Award },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-bold">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Center Column (1/3): Charts ---- */}
      <div className="space-y-4">
        {/* Radar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attribute Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Radar
                    name={player.name}
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance trend line chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Trend (Last 8 Matches)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="match"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[5, 10]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#10b981" }}
                    name="Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Right Column (1/3): Heat Map + Metrics + Recent ---- */}
      <div className="space-y-4">
        {/* Heat map placeholder */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Heat Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[200px] w-full rounded-lg bg-emerald-900/30 overflow-hidden">
              {/* Field lines */}
              <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-lg" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full border border-emerald-500/30" />

              {/* Intensity dots */}
              {[
                { x: 75, y: 30, o: 0.9 },
                { x: 80, y: 40, o: 0.7 },
                { x: 70, y: 50, o: 0.6 },
                { x: 85, y: 35, o: 0.8 },
                { x: 65, y: 45, o: 0.5 },
                { x: 78, y: 55, o: 0.65 },
                { x: 82, y: 25, o: 0.75 },
                { x: 60, y: 40, o: 0.4 },
                { x: 72, y: 60, o: 0.45 },
                { x: 88, y: 45, o: 0.85 },
              ].map((dot, i) => (
                <div
                  key={i}
                  className="absolute h-5 w-5 rounded-full bg-emerald-400"
                  style={{
                    left: `${dot.x}%`,
                    top: `${dot.y}%`,
                    opacity: dot.o,
                    transform: "translate(-50%, -50%)",
                    filter: "blur(4px)",
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Footprints className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Dist. Covered (avg)</span>
                </div>
                <span className="text-sm font-bold">
                  {player.stats.distanceCovered
                    ? (player.stats.distanceCovered / player.stats.matchesPlayed).toFixed(1)
                    : "N/A"}{" "}
                  km
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">Top Speed</span>
                </div>
                <span className="text-sm font-bold">
                  {player.stats.topSpeed ? `${player.stats.topSpeed} km/h` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">Sprint Count (avg)</span>
                </div>
                <span className="text-sm font-bold">
                  {player.stats.sprintCount
                    ? Math.round(player.stats.sprintCount / player.stats.matchesPlayed)
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent matches */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentMatches.map((match, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      match.result === "W"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : match.result === "D"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {match.result}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">vs {match.opponent}</p>
                    <p className="text-xs text-muted-foreground">{match.score}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold">{match.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===========================================================================
// Comparison View Component
// ===========================================================================

function ComparisonView({ players, onClear }: { players: Player[]; onClear: () => void }) {
  const [p1, p2] = players;

  const radarData1 = getRadarData(p1);
  const radarData2 = getRadarData(p2);

  // Merge radar data for overlay
  const mergedRadarData = radarData1.map((item, i) => ({
    attribute: item.attribute,
    [p1.name]: item.value,
    [p2.name]: radarData2[i].value,
  }));

  // Stats for bar comparison
  const comparisonStats = [
    { label: "Goals", p1: p1.stats.goals ?? 0, p2: p2.stats.goals ?? 0 },
    { label: "Assists", p1: p1.stats.assists ?? 0, p2: p2.stats.assists ?? 0 },
    { label: "Matches", p1: p1.stats.matchesPlayed, p2: p2.stats.matchesPlayed },
    { label: "Minutes", p1: p1.stats.minutesPlayed, p2: p2.stats.minutesPlayed },
    { label: "Pass Acc %", p1: p1.stats.passAccuracy ?? 0, p2: p2.stats.passAccuracy ?? 0 },
    { label: "Tackles", p1: p1.stats.tackles ?? 0, p2: p2.stats.tackles ?? 0 },
    { label: "Interceptions", p1: p1.stats.interceptions ?? 0, p2: p2.stats.interceptions ?? 0 },
    { label: "Shots on Target", p1: p1.stats.shotsOnTarget ?? 0, p2: p2.stats.shotsOnTarget ?? 0 },
  ];

  const barData = comparisonStats.map((s) => ({
    stat: s.label,
    [p1.name]: s.p1,
    [p2.name]: s.p2,
  }));

  return (
    <div className="space-y-6">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompare className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold">
            {p1.name} vs {p2.name}
          </h2>
        </div>
        <Button variant="outline" onClick={onClear}>
          Clear Comparison
        </Button>
      </div>

      {/* Side-by-side player cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {[p1, p2].map((player) => (
          <Card key={player.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className={cn("text-lg font-bold", getAvatarBg(player.position))}>
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <Badge variant="secondary">#{player.jerseyNumber}</Badge>
                  </div>
                  <Badge className={cn("mt-1", getPositionColor(player.position))}>
                    {player.position}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {player.team} | {getNationalityFlag(player.nationality)} {player.nationality}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold">{playerAvgRating(player).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overlaid Radar Charts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attribute Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={mergedRadarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar
                    name={p1.name}
                    dataKey={p1.name}
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name={p2.name}
                    dataKey={p2.name}
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
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
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                {p1.name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                {p2.name}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Side-by-side bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stats Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="stat"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
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
                  <Bar dataKey={p1.name} fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey={p2.name} fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                {p1.name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                {p2.name}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats table comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Detailed Stats Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">Stat</th>
                  <th className="py-2 px-3 text-center font-medium text-emerald-400">{p1.name}</th>
                  <th className="py-2 px-3 text-center font-medium text-muted-foreground">vs</th>
                  <th className="py-2 px-3 text-center font-medium text-blue-400">{p2.name}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonStats.map((stat) => {
                  const p1Better = stat.p1 > stat.p2;
                  const equal = stat.p1 === stat.p2;
                  return (
                    <tr key={stat.label} className="border-b border-border/50">
                      <td className="py-2 px-3 text-muted-foreground">{stat.label}</td>
                      <td
                        className={cn(
                          "py-2 px-3 text-center font-semibold",
                          !equal && p1Better ? "text-emerald-400" : ""
                        )}
                      >
                        {stat.p1}
                      </td>
                      <td className="py-2 px-3 text-center text-muted-foreground">
                        {equal ? "=" : p1Better ? ">" : "<"}
                      </td>
                      <td
                        className={cn(
                          "py-2 px-3 text-center font-semibold",
                          !equal && !p1Better ? "text-blue-400" : ""
                        )}
                      >
                        {stat.p2}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
