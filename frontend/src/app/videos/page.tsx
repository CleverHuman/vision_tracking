"use client";

import React, { useState, useMemo, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { videos as mockVideosData } from "@/data/mock-data";
import type { Video, VideoCategory, AnalysisStatus } from "@/types";
import { formatDuration, formatDate, cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  FileVideo,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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

const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/x-matroska"];
const ACCEPTED_EXTENSIONS = ".mp4,.mov,.avi,.webm,.mkv";
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

interface UploadItem {
  id: string;
  file: File;
  title: string;
  description: string;
  category: VideoCategory;
  sport: string;
  tags: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

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

export default function VideosPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | VideoCategory>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allVideos = mockVideosData;

  const filteredVideos = useMemo(() => {
    let result = [...allVideos].filter((v) => {
      if (activeCategory !== "all" && v.category !== activeCategory) return false;
      if (filters.sport !== "all" && v.sport !== filters.sport) return false;
      if (filters.analysisStatus !== "all" && v.analysisStatus !== filters.analysisStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!v.title.toLowerCase().includes(q) && !v.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      return true;
    });

    if (filters.dateFrom) {
      result = result.filter((v) => new Date(v.uploadDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter((v) => new Date(v.uploadDate) <= new Date(filters.dateTo));
    }

    if (filters.duration === "short") {
      result = result.filter((v) => v.duration < 1800);
    } else if (filters.duration === "medium") {
      result = result.filter((v) => v.duration >= 1800 && v.duration <= 3600);
    } else if (filters.duration === "long") {
      result = result.filter((v) => v.duration > 3600);
    }

    return result;
  }, [apiVideos, filters.dateFrom, filters.dateTo, filters.duration]);

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

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      const name = file.name.replace(/\.[^.]+$/, "");
      newItems.push({
        id: generateId(),
        file,
        title: name,
        description: "",
        category: "match",
        sport: "soccer",
        tags: "",
        status: "pending",
        progress: 0,
      });
    }
    if (newItems.length > 0) {
      setUploadItems((prev) => [...prev, ...newItems]);
      if (!showUpload) setShowUpload(true);
    }
  }, [showUpload]);

  const removeUploadItem = useCallback((id: string) => {
    setUploadItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateUploadItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setUploadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleUploadAll = useCallback(async () => {
    const pending = uploadItems.filter((item) => item.status === "pending");
    if (pending.length === 0) return;

    setIsUploading(true);

    for (const item of pending) {
      updateUploadItem(item.id, { status: "uploading", progress: 20 });

      try {
        updateUploadItem(item.id, { progress: 50 });
        // TODO: integrate with backend upload API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateUploadItem(item.id, { status: "done", progress: 100 });
      } catch (err) {
        updateUploadItem(item.id, {
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    setIsUploading(false);
  }, [uploadItems, updateUploadItem]);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const clearCompleted = useCallback(() => {
    setUploadItems((prev) => prev.filter((item) => item.status !== "done"));
  }, []);

  const pendingCount = uploadItems.filter((i) => i.status === "pending").length;
  const doneCount = uploadItems.filter((i) => i.status === "done").length;

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
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

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
        <div className="relative aspect-video bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
            <div className="rounded-full bg-white/90 p-3">
              <Play className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </div>
          <div className="absolute left-2 top-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelect(video.id)}
              className="border-white bg-black/30 data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold">{video.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(video.uploadDate)} &middot; {formatDuration(video.duration)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                "capitalize",
                sportColors[video.sport] ?? "bg-gray-500/20 text-gray-400"
              )}
            >
              {video.sport}
            </Badge>

            {getAnalysisBadge(video.analysisStatus)}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {video.teams.join(" vs ")}
          </p>

          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>{video.views} views</span>
          </div>

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
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelect(video.id)}
        />

        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-muted">
          <div className="flex h-full items-center justify-center">
            <Film className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white">
            {formatDuration(video.duration)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-sm">{video.title}</h3>
          <p className="text-xs text-muted-foreground">{video.teams.join(" vs ")}</p>
        </div>

        <span className="hidden shrink-0 text-xs text-muted-foreground md:block">
          {formatDate(video.uploadDate)}
        </span>

        <span className="hidden shrink-0 text-xs text-muted-foreground lg:block">
          {formatDuration(video.duration)}
        </span>

        <Badge
          className={cn(
            "hidden shrink-0 capitalize sm:inline-flex",
            sportColors[video.sport] ?? "bg-gray-500/20 text-gray-400"
          )}
        >
          {video.sport}
        </Badge>

        <div className="hidden shrink-0 md:block">{getAnalysisBadge(video.analysisStatus)}</div>

        <div className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground lg:flex">
          <Eye className="h-3.5 w-3.5" />
          {video.views}
        </div>

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

  return (
    <AppLayout>
      <div className="space-y-6 p-6">

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

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
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

          <p className="text-sm text-muted-foreground">
            {filteredVideos.length} video{filteredVideos.length !== 1 && "s"} found
          </p>
        </div>

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

          {showFilters && (
            <Card className="mt-4">
              <CardContent className="flex flex-wrap items-end gap-4 p-4">
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

          {showUpload && (
            <div className="mt-4 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors",
                  isDragOver
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-border bg-muted/30 hover:border-muted-foreground/50"
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
                  Supports MP4, MOV, AVI, WebM, MKV &mdash; Up to 5 GB per file
                </p>
              </div>

              {uploadItems.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Upload Queue ({uploadItems.length} file{uploadItems.length !== 1 && "s"})
                      </h3>
                      <div className="flex items-center gap-2">
                        {doneCount > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearCompleted}>
                            Clear completed
                          </Button>
                        )}
                        <Button
                          variant="sport"
                          size="sm"
                          onClick={handleUploadAll}
                          disabled={isUploading || pendingCount === 0}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5" />
                              Upload All ({pendingCount})
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {uploadItems.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-3",
                            item.status === "done" && "border-emerald-500/30 bg-emerald-500/5",
                            item.status === "error" && "border-destructive/30 bg-destructive/5"
                          )}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <FileVideo className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">{item.title}</p>
                              <Badge variant="secondary" className="shrink-0 text-[10px]">
                                {formatFileSize(item.file.size)}
                              </Badge>
                            </div>

                            {item.status === "uploading" && (
                              <Progress value={item.progress} className="mt-1.5 h-1.5" />
                            )}

                            {item.status === "done" && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Upload complete
                              </p>
                            )}

                            {item.status === "error" && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                {item.error || "Upload failed"}
                              </p>
                            )}

                            {item.status === "pending" && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {item.category} &middot; {item.sport}
                                {item.tags && ` · ${item.tags}`}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            {item.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingItem(item.id)}
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {(item.status === "pending" || item.status === "error") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeUploadItem(item.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Dialog
                open={editingItem !== null}
                onOpenChange={(open) => { if (!open) setEditingItem(null); }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Video Details</DialogTitle>
                    <DialogDescription>
                      Set metadata before uploading.
                    </DialogDescription>
                  </DialogHeader>
                  {editingItem && (() => {
                    const item = uploadItems.find((i) => i.id === editingItem);
                    if (!item) return null;
                    return (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="upload-title">Title</Label>
                          <Input
                            id="upload-title"
                            value={item.title}
                            onChange={(e) => updateUploadItem(item.id, { title: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="upload-description">Description</Label>
                          <Textarea
                            id="upload-description"
                            value={item.description}
                            onChange={(e) => updateUploadItem(item.id, { description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={item.category}
                              onValueChange={(val) => updateUploadItem(item.id, { category: val as VideoCategory })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="match">Match Footage</SelectItem>
                                <SelectItem value="training">Training Session</SelectItem>
                                <SelectItem value="drills">Individual Drill</SelectItem>
                                <SelectItem value="opponent">Opponent Analysis</SelectItem>
                                <SelectItem value="highlights">Highlight Reel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Sport</Label>
                            <Select
                              value={item.sport}
                              onValueChange={(val) => updateUploadItem(item.id, { sport: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="soccer">Soccer</SelectItem>
                                <SelectItem value="basketball">Basketball</SelectItem>
                                <SelectItem value="baseball">Baseball</SelectItem>
                                <SelectItem value="tennis">Tennis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="upload-tags">Tags (comma-separated)</Label>
                          <Input
                            id="upload-tags"
                            value={item.tags}
                            onChange={(e) => updateUploadItem(item.id, { tags: e.target.value })}
                            placeholder="e.g. highlights, first-half, set-pieces"
                          />
                        </div>
                      </div>
                    );
                  })()}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingItem(null)}>
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredVideos.map(renderVideoCard)}
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-2">
                {filteredVideos.map(renderListRow)}
              </div>
            ) : (
              <div className="relative space-y-4 pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border">
                {filteredVideos
                  .sort(
                    (a, b) =>
                      new Date(b.uploadDate).getTime() -
                      new Date(a.uploadDate).getTime()
                  )
                  .map((video) => (
                    <div key={video.id} className="relative">
                      <div className="absolute -left-8 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-background">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>

                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {formatDate(video.uploadDate)}
                      </p>

                      <Card className="overflow-hidden">
                        <div className="flex gap-4 p-4">
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
