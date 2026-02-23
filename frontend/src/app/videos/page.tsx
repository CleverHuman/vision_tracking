"use client";

import React, { useState, useMemo, DragEvent } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useVideos } from "@/hooks";
import type { Video, VideoCategory, AnalysisStatus } from "@/types";
import { formatDuration, formatDate, cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Upload,
  Play,
  Search,
  Filter,
  LayoutGrid,
  List,
  Clock,
  Eye,
  MoreVertical,
  Trash2,
  Tag,
  Download,
  Share2,
  ChevronDown,
  X,
  Film,
  CheckSquare,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const _categoryLabels: Record<VideoCategory, string> = {
  match: "Match Footage",
  training: "Training Sessions",
  drills: "Individual Drills",
  opponent: "Opponent Analysis",
  highlights: "Highlight Reels",
};
void _categoryLabels;

const sportColors: Record<string, string> = {
  soccer: "bg-emerald-500/20 text-emerald-400",
  basketball: "bg-orange-500/20 text-orange-400",
  baseball: "bg-blue-500/20 text-blue-400",
  tennis: "bg-yellow-500/20 text-yellow-400",
};

function getAnalysisBadge(status: AnalysisStatus) {
  switch (status) {
    case "unprocessed":
      return <Badge variant="outline">Unprocessed</Badge>;
    case "processing":
      return <Badge variant="processing">Processing</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "failed":
      return (
        <Badge variant="destructive">Failed</Badge>
      );
  }
}

// ---------------------------------------------------------------------------
// Filters state shape
// ---------------------------------------------------------------------------

interface Filters {
  dateFrom: string;
  dateTo: string;
  sport: string;
  analysisStatus: string;
  duration: string;
}

const defaultFilters: Filters = {
  dateFrom: "",
  dateTo: "",
  sport: "all",
  analysisStatus: "all",
  duration: "all",
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function VideosPage() {
  // View & UI state
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | VideoCategory>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch videos from API
  const videoFilters = useMemo(
    () => ({
      category: activeCategory !== "all" ? activeCategory : undefined,
      sport: filters.sport !== "all" ? filters.sport : undefined,
      status: filters.analysisStatus !== "all" ? filters.analysisStatus : undefined,
      search: searchQuery.trim() || undefined,
    }),
    [activeCategory, filters.sport, filters.analysisStatus, searchQuery]
  );
  const { data: apiVideos } = useVideos(videoFilters, 50);

  // ---------- filtering logic (client-side for date/duration since API may not support) ----------

  const filteredVideos = useMemo(() => {
    let result = [...apiVideos];

    // Date range (client-side filter)
    if (filters.dateFrom) {
      result = result.filter((v) => new Date(v.uploadDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter((v) => new Date(v.uploadDate) <= new Date(filters.dateTo));
    }

    // Duration (client-side filter)
    if (filters.duration === "short") {
      result = result.filter((v) => v.duration < 1800);
    } else if (filters.duration === "medium") {
      result = result.filter((v) => v.duration >= 1800 && v.duration <= 3600);
    } else if (filters.duration === "long") {
      result = result.filter((v) => v.duration > 3600);
    }

    return result;
  }, [apiVideos, filters.dateFrom, filters.dateTo, filters.duration]);

  // ---------- selection helpers ----------

  const toggleSelect = (id: string) => {
    setSelectedVideos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map((v) => v.id));
    }
  };

  // ---------- drag & drop handlers ----------

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    // File handling would go here in a real application
  };

  // ---------- render helpers ----------

  const renderVideoCard = (video: Video) => {
    const isSelected = selectedVideos.includes(video.id);

    return (
      <Card
        key={video.id}
        className={cn(
          "group overflow-hidden transition-all hover:shadow-md",
          isSelected && "ring-2 ring-emerald-500"
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
            <div className="rounded-full bg-white/90 p-3">
              <Play className="h-6 w-6 text-black" />
            </div>
          </div>
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </div>
          {/* Selection checkbox */}
          <div className="absolute left-2 top-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelect(video.id)}
              className="border-white bg-black/30 data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="line-clamp-1 font-semibold">{video.title}</h3>

          {/* Date & duration */}
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(video.uploadDate)} &middot; {formatDuration(video.duration)}
          </p>

          {/* Sport badge */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                "capitalize",
                sportColors[video.sport] ?? "bg-gray-500/20 text-gray-400"
              )}
            >
              {video.sport}
            </Badge>

            {/* Analysis status */}
            {getAnalysisBadge(video.analysisStatus)}
          </div>

          {/* Teams */}
          <p className="mt-2 text-xs text-muted-foreground">
            {video.teams.join(" vs ")}
          </p>

          {/* Views */}
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>{video.views} views</span>
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              {video.tags.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{video.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Play className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Search className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListRow = (video: Video) => {
    const isSelected = selectedVideos.includes(video.id);

    return (
      <div
        key={video.id}
        className={cn(
          "group flex items-center gap-4 rounded-lg border border-border/50 bg-card p-3 transition-all hover:shadow-sm",
          isSelected && "ring-2 ring-emerald-500"
        )}
      >
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelect(video.id)}
        />

        {/* Thumbnail (small) */}
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-muted">
          <div className="flex h-full items-center justify-center">
            <Film className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-sm">{video.title}</h3>
          <p className="text-xs text-muted-foreground">{video.teams.join(" vs ")}</p>
        </div>

        {/* Date */}
        <span className="hidden shrink-0 text-xs text-muted-foreground md:block">
          {formatDate(video.uploadDate)}
        </span>

        {/* Duration */}
        <span className="hidden shrink-0 text-xs text-muted-foreground lg:block">
          {formatDuration(video.duration)}
        </span>

        {/* Sport */}
        <Badge
          className={cn(
            "hidden shrink-0 capitalize sm:inline-flex",
            sportColors[video.sport] ?? "bg-gray-500/20 text-gray-400"
          )}
        >
          {video.sport}
        </Badge>

        {/* Status */}
        <div className="hidden shrink-0 md:block">{getAnalysisBadge(video.analysisStatus)}</div>

        {/* Views */}
        <div className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground lg:flex">
          <Eye className="h-3.5 w-3.5" />
          {video.views}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Play className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Search className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

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
            <h1 className="text-2xl font-bold tracking-tight">Video Library</h1>
            <p className="text-sm text-muted-foreground">
              Browse, search, and manage all your sports video footage and analysis recordings.
            </p>
          </div>
          <Button
            variant="sport"
            onClick={() => setShowUpload((v) => !v)}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>

        {/* ============================================================== */}
        {/* View Toggle & Filters Bar                                       */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side: view toggle + search */}
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center rounded-lg border border-border/50 bg-muted p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "timeline"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="h-4 w-4" />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9"
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

            {/* Filter toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
              className={cn(showFilters && "bg-accent")}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showFilters && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Right side: results count */}
          <p className="text-sm text-muted-foreground">
            {filteredVideos.length} video{filteredVideos.length !== 1 && "s"} found
          </p>
        </div>

        {/* ============================================================== */}
        {/* Category Tabs                                                   */}
        {/* ============================================================== */}
        <Tabs
          value={activeCategory}
          onValueChange={(val) => setActiveCategory(val as "all" | VideoCategory)}
        >
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="match">Match Footage</TabsTrigger>
            <TabsTrigger value="training">Training Sessions</TabsTrigger>
            <TabsTrigger value="drills">Individual Drills</TabsTrigger>
            <TabsTrigger value="opponent">Opponent Analysis</TabsTrigger>
            <TabsTrigger value="highlights">Highlight Reels</TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* Advanced Filters Panel (collapsible)                          */}
          {/* ============================================================ */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="flex flex-wrap items-end gap-4 p-4">
                {/* Date from */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, dateFrom: e.target.value }))
                    }
                    className="w-40"
                  />
                </div>

                {/* Date to */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, dateTo: e.target.value }))
                    }
                    className="w-40"
                  />
                </div>

                {/* Sport */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Sport</label>
                  <Select
                    value={filters.sport}
                    onValueChange={(val) =>
                      setFilters((f) => ({ ...f, sport: val }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      <SelectItem value="soccer">Soccer</SelectItem>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="baseball">Baseball</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Analysis Status */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Analysis Status
                  </label>
                  <Select
                    value={filters.analysisStatus}
                    onValueChange={(val) =>
                      setFilters((f) => ({ ...f, analysisStatus: val }))
                    }
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unprocessed">Unprocessed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Duration</label>
                  <Select
                    value={filters.duration}
                    onValueChange={(val) =>
                      setFilters((f) => ({ ...f, duration: val }))
                    }
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Any Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      <SelectItem value="short">Short (&lt;30 min)</SelectItem>
                      <SelectItem value="medium">Medium (30-60 min)</SelectItem>
                      <SelectItem value="long">Long (&gt;60 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters(defaultFilters)}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ============================================================ */}
          {/* Drag & Drop Upload Zone                                       */}
          {/* ============================================================ */}
          {showUpload && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors",
                isDragOver
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-border bg-muted/30"
              )}
            >
              <Upload
                className={cn(
                  "mb-3 h-10 w-10",
                  isDragOver ? "text-emerald-500" : "text-muted-foreground"
                )}
              />
              <p className="text-sm font-medium">
                Drag &amp; drop video files here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports MP4, MOV, AVI &mdash; Multiple files allowed
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* Bulk Actions Bar                                              */}
          {/* ============================================================ */}
          {selectedVideos.length > 0 && (
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2">
              <Checkbox
                checked={selectedVideos.length === filteredVideos.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedVideos.length} selected
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Analyze
                </Button>
                <Button variant="outline" size="sm">
                  <Tag className="h-3.5 w-3.5" />
                  Tag
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* Video Content (Grid / List / Timeline)                        */}
          {/* ============================================================ */}
          {/* We use a single TabsContent wrapping all category values so the
              view mode toggle is independent of the category tabs. The
              filtering is already handled by the useMemo above. */}
          <TabsContent value={activeCategory} className="mt-4">
            {filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Film className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="font-semibold">No videos found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* ---------- Grid View ---------- */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredVideos.map(renderVideoCard)}
              </div>
            ) : viewMode === "list" ? (
              /* ---------- List View ---------- */
              <div className="space-y-2">
                {filteredVideos.map(renderListRow)}
              </div>
            ) : (
              /* ---------- Timeline View ---------- */
              <div className="relative space-y-4 pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border">
                {filteredVideos
                  .sort(
                    (a, b) =>
                      new Date(b.uploadDate).getTime() -
                      new Date(a.uploadDate).getTime()
                  )
                  .map((video) => (
                    <div key={video.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-8 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-background">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>

                      {/* Date label */}
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {formatDate(video.uploadDate)}
                      </p>

                      {/* Card */}
                      <Card className="overflow-hidden">
                        <div className="flex gap-4 p-4">
                          {/* Thumbnail small */}
                          <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded bg-muted">
                            <div className="flex h-full items-center justify-center">
                              <Film className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                            <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white">
                              {formatDuration(video.duration)}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-sm">
                              {video.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {video.teams.join(" vs ")} &middot;{" "}
                              {formatDuration(video.duration)}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge
                                className={cn(
                                  "capitalize",
                                  sportColors[video.sport] ??
                                    "bg-gray-500/20 text-gray-400"
                                )}
                              >
                                {video.sport}
                              </Badge>
                              {getAnalysisBadge(video.analysisStatus)}
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {video.views}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-start gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Search className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ============================================================== */}
        {/* Bottom Actions                                                  */}
        {/* ============================================================== */}
        <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
          <Button variant="outline">
            <Film className="h-4 w-4" />
            Create Playlist
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export Selected
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
