"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Film,
  Play,
  Plus,
  Share2,
  Download,
  Zap,
  Star,
  Search,
  Scissors,
  Music,
  Image as ImageIcon,
  Instagram,
  Twitter,
  Youtube,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventType = "goal" | "save" | "tackle" | "assist" | "skill" | "set-piece";

interface Highlight {
  id: string;
  title: string;
  player: string;
  match: string;
  date: string;
  duration: string;
  eventType: EventType;
  rating: number;
  views: number;
}

interface ReelClip {
  id: string;
  title: string;
  duration: string;
}

// ---------------------------------------------------------------------------
// Event type badge styles
// ---------------------------------------------------------------------------

const eventBadgeStyles: Record<EventType, string> = {
  goal: "bg-red-500 text-white",
  save: "bg-blue-500 text-white",
  tackle: "bg-emerald-500 text-white",
  assist: "bg-yellow-500 text-black",
  skill: "bg-purple-500 text-white",
  "set-piece": "bg-orange-500 text-white",
};

const eventLabels: Record<EventType, string> = {
  goal: "Goal",
  save: "Save",
  tackle: "Tackle",
  assist: "Assist",
  skill: "Skill",
  "set-piece": "Set Piece",
};

// ---------------------------------------------------------------------------
// Mock highlights data
// ---------------------------------------------------------------------------

const mockHighlights: Highlight[] = [
  {
    id: "h1",
    title: "Saka's Stunning Goal vs Chelsea",
    player: "Bukayo Saka",
    match: "Arsenal vs Chelsea",
    date: "2025-03-15",
    duration: "0:24",
    eventType: "goal",
    rating: 5,
    views: 12400,
  },
  {
    id: "h2",
    title: "Ramsdale Double Save",
    player: "Aaron Ramsdale",
    match: "Arsenal vs Liverpool",
    date: "2025-03-10",
    duration: "0:18",
    eventType: "save",
    rating: 4,
    views: 8700,
  },
  {
    id: "h3",
    title: "Saliba's Crucial Tackle",
    player: "William Saliba",
    match: "Arsenal vs Man City",
    date: "2025-03-08",
    duration: "0:12",
    eventType: "tackle",
    rating: 4,
    views: 6200,
  },
  {
    id: "h4",
    title: "Odegaard's Perfect Through Ball",
    player: "Martin Odegaard",
    match: "Arsenal vs Tottenham",
    date: "2025-03-05",
    duration: "0:20",
    eventType: "assist",
    rating: 5,
    views: 9800,
  },
  {
    id: "h5",
    title: "Martinelli Skill Run Past Three",
    player: "Gabriel Martinelli",
    match: "Arsenal vs Newcastle",
    date: "2025-03-01",
    duration: "0:32",
    eventType: "skill",
    rating: 5,
    views: 15300,
  },
  {
    id: "h6",
    title: "Corner Routine Goal",
    player: "Gabriel Magalhaes",
    match: "Arsenal vs Brighton",
    date: "2025-02-28",
    duration: "0:28",
    eventType: "set-piece",
    rating: 3,
    views: 4500,
  },
  {
    id: "h7",
    title: "Rice Volley from Distance",
    player: "Declan Rice",
    match: "Arsenal vs Wolves",
    date: "2025-02-24",
    duration: "0:16",
    eventType: "goal",
    rating: 5,
    views: 18200,
  },
  {
    id: "h8",
    title: "Raya Penalty Save",
    player: "David Raya",
    match: "Arsenal vs Aston Villa",
    date: "2025-02-20",
    duration: "0:22",
    eventType: "save",
    rating: 4,
    views: 11000,
  },
  {
    id: "h9",
    title: "White's Recovery Tackle",
    player: "Ben White",
    match: "Arsenal vs West Ham",
    date: "2025-02-18",
    duration: "0:10",
    eventType: "tackle",
    rating: 3,
    views: 3200,
  },
  {
    id: "h10",
    title: "Havertz Backheel Assist",
    player: "Kai Havertz",
    match: "Arsenal vs Everton",
    date: "2025-02-15",
    duration: "0:26",
    eventType: "assist",
    rating: 4,
    views: 7600,
  },
  {
    id: "h11",
    title: "Saka Nutmeg and Cross",
    player: "Bukayo Saka",
    match: "Arsenal vs Fulham",
    date: "2025-02-12",
    duration: "0:30",
    eventType: "skill",
    rating: 4,
    views: 9100,
  },
  {
    id: "h12",
    title: "Free Kick Curler into Top Corner",
    player: "Martin Odegaard",
    match: "Arsenal vs Crystal Palace",
    date: "2025-02-08",
    duration: "0:20",
    eventType: "goal",
    rating: 5,
    views: 21500,
  },
];

// ---------------------------------------------------------------------------
// Social media platform presets
// ---------------------------------------------------------------------------

const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    aspect: "1:1 (Square)",
    resolution: "1080x1080",
    maxDuration: "60s",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Twitter,
    aspect: "16:9",
    resolution: "1280x720",
    maxDuration: "140s",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    aspect: "16:9 HD",
    resolution: "1920x1080",
    maxDuration: "No limit",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Film,
    aspect: "9:16 (Vertical)",
    resolution: "1080x1920",
    maxDuration: "180s",
  },
];

// ---------------------------------------------------------------------------
// Category tabs
// ---------------------------------------------------------------------------

const categories = [
  { value: "all", label: "All" },
  { value: "goal", label: "Goals" },
  { value: "save", label: "Saves" },
  { value: "tackle", label: "Tackles" },
  { value: "assist", label: "Assists" },
  { value: "skill", label: "Skills" },
  { value: "set-piece", label: "Set Pieces" },
];

// ---------------------------------------------------------------------------
// Helper: render star rating
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: format date
// ---------------------------------------------------------------------------

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Helper: parse duration string "M:SS" to seconds
// ---------------------------------------------------------------------------

function parseDurationToSeconds(dur: string): number {
  const parts = dur.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}

function formatSecondsToDisplay(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function HighlightsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playerFilter, setPlayerFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [reelClips, setReelClips] = useState<ReelClip[]>([
    { id: "h1", title: "Saka's Stunning Goal vs Chelsea", duration: "0:24" },
    { id: "h7", title: "Rice Volley from Distance", duration: "0:16" },
    { id: "h5", title: "Martinelli Skill Run Past Three", duration: "0:32" },
  ]);
  const [showReelBuilder, setShowReelBuilder] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [addMusic, setAddMusic] = useState(false);
  const [addBranding, setAddBranding] = useState(false);
  const [addTransitions, setAddTransitions] = useState(true);
  const [addTeamLogo, setAddTeamLogo] = useState(true);
  const [watermarkText, setWatermarkText] = useState("");

  // ---------- Derived data ----------

  const uniquePlayers = Array.from(
    new Set(mockHighlights.map((h) => h.player))
  );
  const uniqueMatches = Array.from(
    new Set(mockHighlights.map((h) => h.match))
  );

  // ---------- Filtering & sorting ----------

  const filteredHighlights = mockHighlights
    .filter((h) => {
      if (activeCategory !== "all" && h.eventType !== activeCategory)
        return false;
      if (
        searchQuery.trim() &&
        !h.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !h.player.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (playerFilter !== "all" && h.player !== playerFilter) return false;
      if (matchFilter !== "all" && h.match !== matchFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "most-viewed":
          return b.views - a.views;
        case "top-rated":
          return b.rating - a.rating;
        case "newest":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  // ---------- Reel helpers ----------

  const addToReel = (highlight: Highlight) => {
    if (reelClips.find((c) => c.id === highlight.id)) return;
    setReelClips((prev) => [
      ...prev,
      { id: highlight.id, title: highlight.title, duration: highlight.duration },
    ]);
    setShowReelBuilder(true);
  };

  const removeFromReel = (clipId: string) => {
    setReelClips((prev) => prev.filter((c) => c.id !== clipId));
  };

  const totalReelDuration = reelClips.reduce((acc, clip) => {
    return acc + parseDurationToSeconds(clip.duration);
  }, 0);

  // ---------- Quick stats ----------

  const totalClips = mockHighlights.length;
  const totalDurationSeconds = mockHighlights.reduce(
    (acc, h) => acc + parseDurationToSeconds(h.duration),
    0
  );

  const playerCounts: Record<string, number> = {};
  mockHighlights.forEach((h) => {
    playerCounts[h.player] = (playerCounts[h.player] || 0) + 1;
  });
  const mostFeaturedPlayer = Object.entries(playerCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // -----------------------------------------------------------------------
  // JSX
  // -----------------------------------------------------------------------

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* ============================================================== */}
        {/* Page Header                                                     */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Highlights &amp; Clips
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse, create, and share your best moments from match footage
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="sport"
              onClick={() => setShowReelBuilder((v) => !v)}
            >
              <Scissors className="h-4 w-4" />
              Create Highlight Reel
            </Button>
            <Button
              className="bg-purple-600 text-white shadow hover:bg-purple-700"
            >
              <Zap className="h-4 w-4" />
              AI Auto-Generate
            </Button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Quick Stats                                                     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <Film className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Clips</p>
                <p className="text-lg font-bold">{totalClips}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Play className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Duration</p>
                <p className="text-lg font-bold">
                  {formatSecondsToDisplay(totalDurationSeconds)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Star className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Most Featured Player
                </p>
                <p className="text-lg font-bold">
                  {mostFeaturedPlayer
                    ? `${mostFeaturedPlayer[0]} (${mostFeaturedPlayer[1]})`
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================== */}
        {/* Category Tabs                                                   */}
        {/* ============================================================== */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
        >
          <TabsList className="flex-wrap">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ============================================================ */}
          {/* Filter Bar                                                    */}
          {/* ============================================================ */}
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search highlights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Player filter */}
            <Select value={playerFilter} onValueChange={setPlayerFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Players" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Players</SelectItem>
                {uniquePlayers.map((player) => (
                  <SelectItem key={player} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Match filter */}
            <Select value={matchFilter} onValueChange={setMatchFilter}>
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="All Matches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                {uniqueMatches.map((match) => (
                  <SelectItem key={match} value={match}>
                    {match}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most-viewed">Most Viewed</SelectItem>
                <SelectItem value="top-rated">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="mt-3 text-sm text-muted-foreground">
            {filteredHighlights.length} highlight
            {filteredHighlights.length !== 1 && "s"} found
          </p>

          {/* ============================================================ */}
          {/* Highlights Grid                                               */}
          {/* ============================================================ */}
          <TabsContent value={activeCategory} className="mt-4">
            {filteredHighlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Film className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="font-semibold">No highlights found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredHighlights.map((highlight) => (
                  <Card
                    key={highlight.id}
                    className="group overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-zinc-800">
                      {/* Placeholder background */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="h-12 w-12 text-muted-foreground/30" />
                      </div>

                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                        <div className="rounded-full bg-white/90 p-3">
                          <Play className="h-6 w-6 text-black" />
                        </div>
                      </div>

                      {/* Event type badge (top-left) */}
                      <div className="absolute left-2 top-2">
                        <Badge
                          className={cn(
                            "text-[10px] font-bold border-0",
                            eventBadgeStyles[highlight.eventType]
                          )}
                        >
                          {eventLabels[highlight.eventType]}
                        </Badge>
                      </div>

                      {/* Duration badge (bottom-right) */}
                      <div className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
                        {highlight.duration}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      {/* Title */}
                      <h3 className="line-clamp-1 font-semibold text-sm">
                        {highlight.title}
                      </h3>

                      {/* Player & Match */}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {highlight.player} &middot; {highlight.match}
                      </p>

                      {/* Date */}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDisplayDate(highlight.date)}
                      </p>

                      {/* Star Rating */}
                      <div className="mt-2">
                        <StarRating rating={highlight.rating} />
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => addToReel(highlight)}
                          title="Add to Reel"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ============================================================== */}
        {/* Highlight Reel Builder (Bottom Panel)                           */}
        {/* ============================================================== */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">My Highlight Reel</CardTitle>
                <Badge variant="secondary">
                  {reelClips.length} clip{reelClips.length !== 1 && "s"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReelBuilder((v) => !v)}
              >
                {showReelBuilder ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
                {showReelBuilder ? "Collapse" : "Expand"}
              </Button>
            </div>
          </CardHeader>

          {showReelBuilder && (
            <CardContent className="space-y-4">
              {/* Horizontal scrollable clip strip */}
              {reelClips.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8">
                  <Scissors className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No clips added yet. Click the + button on a highlight to add
                    it to your reel.
                  </p>
                </div>
              ) : (
                <ScrollArea className="w-full">
                  <div className="flex gap-3 pb-2">
                    {reelClips.map((clip) => (
                      <div
                        key={clip.id}
                        className="group relative flex shrink-0 items-center gap-2 rounded-lg border border-border/50 bg-muted/50 p-2"
                      >
                        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                        {/* Mini thumbnail */}
                        <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-zinc-800">
                          <Film className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium max-w-[120px]">
                            {clip.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {clip.duration}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => removeFromReel(clip.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Drag to reorder hint */}
              {reelClips.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  Drag clips to reorder them in the reel
                </p>
              )}

              {/* Total duration */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-2">
                <span className="text-sm text-muted-foreground">
                  Total Duration
                </span>
                <span className="text-sm font-bold">
                  {formatSecondsToDisplay(totalReelDuration)}
                </span>
              </div>

              <Separator />

              {/* Options toggles */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="add-music" className="text-sm">
                      Add Music
                    </Label>
                  </div>
                  <Switch
                    id="add-music"
                    checked={addMusic}
                    onCheckedChange={setAddMusic}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="add-branding" className="text-sm">
                      Add Branding
                    </Label>
                  </div>
                  <Switch
                    id="add-branding"
                    checked={addBranding}
                    onCheckedChange={setAddBranding}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="add-transitions" className="text-sm">
                      Add Transitions
                    </Label>
                  </div>
                  <Switch
                    id="add-transitions"
                    checked={addTransitions}
                    onCheckedChange={setAddTransitions}
                  />
                </div>
              </div>

              <Separator />

              {/* Export options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Export Options</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    <Instagram className="mr-1 h-3 w-3" />
                    Instagram
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    <Twitter className="mr-1 h-3 w-3" />
                    Twitter / X
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    <Youtube className="mr-1 h-3 w-3" />
                    YouTube
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    Custom Resolution
                  </Badge>
                </div>
              </div>

              {/* Export button */}
              <div className="flex items-center gap-2">
                <Button
                  variant="sport"
                  className="flex-1"
                  onClick={() => setShowExportPanel(true)}
                  disabled={reelClips.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export Reel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* ============================================================== */}
        {/* Social Media Export Panel                                        */}
        {/* ============================================================== */}
        {showExportPanel && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Social Media Export
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExportPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Card
                      key={platform.id}
                      className="overflow-hidden transition-all hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {platform.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {platform.aspect}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Resolution: {platform.resolution}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Max Duration: {platform.maxDuration}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Separator />

              {/* Branding Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Branding Options</h4>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 sm:flex-1">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="add-team-logo" className="text-sm">
                        Add Team Logo
                      </Label>
                    </div>
                    <Switch
                      id="add-team-logo"
                      checked={addTeamLogo}
                      onCheckedChange={setAddTeamLogo}
                    />
                  </div>
                  <div className="sm:flex-1">
                    <Input
                      placeholder="Custom watermark text..."
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
