"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  videos as mockVideos,
  players as mockPlayers,
  matchEvents as mockMatchEvents,
  heatMapData as mockHeatMapData,
  formations as mockFormations,
} from "@/data/mock-data";
import type { AnalysisType } from "@/types";
import { formatDuration, cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Pencil,
  ArrowRight,
  Circle,
  Square,
  Eraser,
  Undo,
  Redo,
  Trash2,
  BarChart3,
  Users,
  Target,
  Flag,
  Search,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Download,
  Share2,
  Zap,
  Eye,
  Activity,
  Timer,
  Gauge,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DrawingTool = "pencil" | "arrow" | "circle" | "square" | "eraser" | null;

interface AnalysisTypeOption {
  id: AnalysisType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface DetectionItem {
  id: string;
  timestamp: string;
  playerName: string;
  playerNumber: number;
  eventType: string;
  confidence: number;
}

interface KeyMoment {
  id: string;
  timestamp: number;
  description: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const analysisTypes: AnalysisTypeOption[] = [
  { id: "full_match", label: "Full Match Analysis", icon: <BarChart3 className="h-4 w-4" />, description: "Complete match breakdown" },
  { id: "player_tracking", label: "Player Tracking", icon: <Users className="h-4 w-4" />, description: "Track player movements" },
  { id: "tactical", label: "Tactical Analysis", icon: <Target className="h-4 w-4" />, description: "Tactical pattern analysis" },
  { id: "set_piece", label: "Set Piece Analysis", icon: <Flag className="h-4 w-4" />, description: "Set piece breakdowns" },
  { id: "opponent_scouting", label: "Opponent Scouting", icon: <Search className="h-4 w-4" />, description: "Scout opposition patterns" },
  { id: "performance_review", label: "Performance Review", icon: <TrendingUp className="h-4 w-4" />, description: "Player performance metrics" },
];

const soccerModels = [
  { id: "player-tracking", label: "Player tracking" },
  { id: "pass-network", label: "Pass network" },
  { id: "shot-analysis", label: "Shot analysis" },
  { id: "defensive-line", label: "Defensive line" },
  { id: "pressing-intensity", label: "Pressing intensity" },
];

const drawingColors = [
  { label: "Red", value: "#ef4444" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Yellow", value: "#eab308" },
  { label: "White", value: "#ffffff" },
];

const mockDetectionFeed: DetectionItem[] = [
  { id: "det-01", timestamp: "00:12", playerName: "Bukayo Saka", playerNumber: 7, eventType: "Sprint detected", confidence: 97 },
  { id: "det-02", timestamp: "00:18", playerName: "Martin Odegaard", playerNumber: 8, eventType: "Key pass", confidence: 94 },
  { id: "det-03", timestamp: "00:23", playerName: "Kai Havertz", playerNumber: 29, eventType: "Header attempt", confidence: 91 },
  { id: "det-04", timestamp: "00:31", playerName: "Declan Rice", playerNumber: 41, eventType: "Ball recovery", confidence: 96 },
  { id: "det-05", timestamp: "00:38", playerName: "William Saliba", playerNumber: 2, eventType: "Clearance", confidence: 93 },
  { id: "det-06", timestamp: "00:45", playerName: "David Raya", playerNumber: 22, eventType: "Distribution", confidence: 89 },
  { id: "det-07", timestamp: "01:02", playerName: "Ben White", playerNumber: 4, eventType: "Overlap run", confidence: 88 },
  { id: "det-08", timestamp: "01:15", playerName: "Bukayo Saka", playerNumber: 7, eventType: "Cross attempt", confidence: 95 },
  { id: "det-09", timestamp: "01:22", playerName: "Gabriel Magalhaes", playerNumber: 6, eventType: "Aerial duel won", confidence: 92 },
  { id: "det-10", timestamp: "01:34", playerName: "Jurrien Timber", playerNumber: 12, eventType: "Interception", confidence: 90 },
  { id: "det-11", timestamp: "01:41", playerName: "Martin Odegaard", playerNumber: 8, eventType: "Through ball", confidence: 97 },
  { id: "det-12", timestamp: "01:55", playerName: "Kai Havertz", playerNumber: 29, eventType: "Shot on target", confidence: 98 },
  { id: "det-13", timestamp: "02:08", playerName: "Leandro Trossard", playerNumber: 19, eventType: "Dribble", confidence: 87 },
  { id: "det-14", timestamp: "02:19", playerName: "Declan Rice", playerNumber: 41, eventType: "Tackle won", confidence: 94 },
  { id: "det-15", timestamp: "02:30", playerName: "Bukayo Saka", playerNumber: 7, eventType: "Goal scored", confidence: 99 },
];

const mockKeyMoments: KeyMoment[] = [
  { id: "km-1", timestamp: 1380, description: "Saka goal - curling shot into far corner", type: "goal" },
  { id: "km-2", timestamp: 1800, description: "Raya double save denies Palmer and Jackson", type: "save" },
  { id: "km-3", timestamp: 2340, description: "Saliba sliding tackle stops breakaway", type: "tackle" },
  { id: "km-4", timestamp: 2820, description: "Palmer free kick equaliser", type: "goal" },
  { id: "km-5", timestamp: 4020, description: "Havertz finishes Odegaard through ball", type: "goal" },
  { id: "km-6", timestamp: 5100, description: "Saka counter-attack seals the win", type: "goal" },
];

const performanceMetrics = {
  distanceCovered: { value: 11.4, unit: "km" },
  sprintCount: { value: 42 },
  topSpeed: { value: 34.2, unit: "km/h" },
  possession: { value: 62 },
  passAccuracy: { value: 89 },
  shotsOnTarget: { value: 8, total: 18 },
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AnalyzePage() {
  // State
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("full_match");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>(null);
  const [drawingColor, setDrawingColor] = useState("#ef4444");
  const [selectedModels, setSelectedModels] = useState<string[]>(["player-tracking"]);
  const [playerDetection, setPlayerDetection] = useState(true);
  const [teamColorId, setTeamColorId] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState([75]);
  const [trackingSmoothness, setTrackingSmoothness] = useState([50]);
  const [frameRate, setFrameRate] = useState("every");
  const [activeTab, setActiveTab] = useState("events");
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [volume, setVolume] = useState([80]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Match info form
  const [matchName, setMatchName] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [venue, setVenue] = useState("");
  const [competition, setCompetition] = useState("");
  const [weather, setWeather] = useState("");

  const feedRef = useRef<HTMLDivElement>(null);

  const selectedVideoData = mockVideos.find((v) => v.id === selectedVideo);
  const totalDuration = selectedVideoData?.duration ?? 5400;

  // Simulate analysis progress
  const startAnalysis = () => {
    setProgress(0);
    setElapsedTime(0);
    setIsAnalyzing(true);
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsAnalyzing(false);
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [isAnalyzing]);

  // Auto-scroll detection feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [isAnalyzing]);

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleStartAnalysis = () => {
    if (!selectedVideo) return;
    startAnalysis();
  };

  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
    setProgress(0);
    setElapsedTime(0);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "goal": return "bg-green-500";
      case "shot": return "bg-yellow-500";
      case "foul": return "bg-red-500";
      case "card": return "bg-red-400";
      case "save": return "bg-blue-500";
      case "corner": return "bg-purple-500";
      case "tackle": return "bg-orange-500";
      case "substitution": return "bg-cyan-500";
      case "pass": return "bg-emerald-400";
      case "offside": return "bg-pink-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusLabel = () => {
    if (isAnalyzing) return "Processing";
    if (progress === 100) return "Completed";
    return "Idle";
  };

  const getStatusColor = () => {
    if (isAnalyzing) return "text-yellow-500";
    if (progress === 100) return "text-green-500";
    return "text-muted-foreground";
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* ================================================================ */}
        {/* LEFT SIDEBAR                                                     */}
        {/* ================================================================ */}
        {showLeftSidebar && (
          <aside className="w-80 border-r bg-card flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Video Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Video Selection</Label>
                  <Select value={selectedVideo} onValueChange={setSelectedVideo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a video..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVideos.map((video) => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Match Information Form */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Match Information</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Match name"
                      value={matchName}
                      onChange={(e) => setMatchName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Home team"
                        value={homeTeam}
                        onChange={(e) => setHomeTeam(e.target.value)}
                      />
                      <Input
                        placeholder="Away team"
                        value={awayTeam}
                        onChange={(e) => setAwayTeam(e.target.value)}
                      />
                    </div>
                    <Input
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                    />
                    <Input
                      placeholder="Venue"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                    />
                    <Input
                      placeholder="Competition"
                      value={competition}
                      onChange={(e) => setCompetition(e.target.value)}
                    />
                    <Select value={weather} onValueChange={setWeather}>
                      <SelectTrigger>
                        <SelectValue placeholder="Weather" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clear">Clear</SelectItem>
                        <SelectItem value="rainy">Rainy</SelectItem>
                        <SelectItem value="cloudy">Cloudy</SelectItem>
                        <SelectItem value="windy">Windy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Analysis Type Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Analysis Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {analysisTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setAnalysisType(type.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all hover:border-primary/50",
                          analysisType === type.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {type.icon}
                        <span className="text-[10px] font-medium leading-tight">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* AI Model Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">AI Models (Soccer)</Label>
                  <div className="space-y-2">
                    {soccerModels.map((model) => (
                      <label
                        key={model.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model.id)}
                          onChange={() => toggleModel(model.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{model.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Analysis Settings */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Settings className="h-3.5 w-3.5" />
                    Analysis Settings
                  </Label>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="player-detection" className="text-sm">
                      Player detection
                    </Label>
                    <Switch
                      id="player-detection"
                      checked={playerDetection}
                      onCheckedChange={setPlayerDetection}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="team-color" className="text-sm">
                      Team color ID
                    </Label>
                    <Switch
                      id="team-color"
                      checked={teamColorId}
                      onCheckedChange={setTeamColorId}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Confidence threshold</Label>
                      <span className="text-xs text-muted-foreground">{confidenceThreshold[0]}%</span>
                    </div>
                    <Slider
                      value={confidenceThreshold}
                      onValueChange={setConfidenceThreshold}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Tracking smoothness</Label>
                      <span className="text-xs text-muted-foreground">{trackingSmoothness[0]}%</span>
                    </div>
                    <Slider
                      value={trackingSmoothness}
                      onValueChange={setTrackingSmoothness}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Frame rate</Label>
                    <Select value={frameRate} onValueChange={setFrameRate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="every">Every frame</SelectItem>
                        <SelectItem value="5th">Every 5th frame</SelectItem>
                        <SelectItem value="10th">Every 10th frame</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Start Analysis Button */}
                <Button
                  onClick={handleStartAnalysis}
                  disabled={!selectedVideo || isAnalyzing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
                  size="lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Start Analysis"}
                </Button>
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Left sidebar toggle */}
        <button
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          className="flex items-center justify-center w-5 border-r bg-muted/50 hover:bg-muted transition-colors"
        >
          {showLeftSidebar ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* ================================================================ */}
        {/* CENTER - MAIN AREA                                               */}
        {/* ================================================================ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Drawing Tools Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-card">
            <span className="text-xs font-semibold text-muted-foreground mr-2">DRAW</span>
            {[
              { tool: "pencil" as DrawingTool, icon: <Pencil className="h-4 w-4" />, label: "Pencil" },
              { tool: "arrow" as DrawingTool, icon: <ArrowRight className="h-4 w-4" />, label: "Arrow" },
              { tool: "circle" as DrawingTool, icon: <Circle className="h-4 w-4" />, label: "Circle" },
              { tool: "square" as DrawingTool, icon: <Square className="h-4 w-4" />, label: "Square" },
              { tool: "eraser" as DrawingTool, icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
            ].map((item) => (
              <Button
                key={item.tool}
                variant={drawingTool === item.tool ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setDrawingTool(drawingTool === item.tool ? null : item.tool)
                }
                title={item.label}
              >
                {item.icon}
              </Button>
            ))}

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Color picker */}
            {drawingColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setDrawingColor(color.value)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-all",
                  drawingColor === color.value
                    ? "border-primary scale-110"
                    : "border-transparent"
                )}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button variant="outline" size="sm" title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" title="Redo">
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" title="Clear all">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Player Area */}
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="p-4 space-y-4">
              {/* Video container */}
              <div className="relative">
                <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {selectedVideoData ? (
                    <div className="text-center space-y-2">
                      <Play className="h-16 w-16 text-white/40 mx-auto" />
                      <p className="text-white/80 text-lg font-medium">
                        {selectedVideoData.title}
                      </p>
                      <p className="text-white/40 text-sm">
                        {formatDuration(selectedVideoData.duration)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Play className="h-16 w-16 text-white/20 mx-auto" />
                      <p className="text-white/40 text-lg">No video selected</p>
                      <p className="text-white/20 text-sm">
                        Select a video from the left panel to begin
                      </p>
                    </div>
                  )}

                  {/* Live tracking badge */}
                  {isAnalyzing && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-600 text-white animate-pulse flex items-center gap-1.5">
                        <Radio className="h-3 w-3" />
                        LIVE TRACKING
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Custom Controls Bar */}
                <div className="mt-2 rounded-lg bg-zinc-800 p-2 space-y-2">
                  {/* Seek bar */}
                  <Slider
                    value={[currentTime]}
                    onValueChange={([val]) => setCurrentTime(val)}
                    min={0}
                    max={totalDuration}
                    step={1}
                    className="w-full"
                  />

                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-white hover:bg-zinc-700"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Frame step back */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}
                      className="text-white hover:text-white hover:bg-zinc-700"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    {/* Frame step forward */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCurrentTime(Math.min(totalDuration, currentTime + 1))
                      }
                      className="text-white hover:text-white hover:bg-zinc-700"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>

                    {/* Time display */}
                    <span className="text-xs text-white/70 font-mono min-w-[100px]">
                      {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </span>

                    <div className="flex-1" />

                    {/* Speed control */}
                    <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                      <SelectTrigger className="w-20 h-7 text-xs bg-zinc-700 border-zinc-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">0.25x</SelectItem>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Volume */}
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-4 w-4 text-white/70" />
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        min={0}
                        max={100}
                        step={1}
                        className="w-20"
                      />
                    </div>

                    {/* Fullscreen */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-zinc-700"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabbed area below video */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="events">Events Timeline</TabsTrigger>
                  <TabsTrigger value="statistics">Statistics</TabsTrigger>
                  <TabsTrigger value="formations">Formations</TabsTrigger>
                </TabsList>

                {/* Events Timeline */}
                <TabsContent value="events">
                  <Card>
                    <CardContent className="p-4">
                      <div className="relative">
                        {/* Timeline track */}
                        <div className="h-12 bg-muted rounded-lg relative overflow-hidden">
                          {/* Time labels */}
                          <div className="absolute inset-0 flex items-end px-2 pb-1">
                            {[0, 15, 30, 45, 60, 75, 90].map((min) => (
                              <span
                                key={min}
                                className="text-[9px] text-muted-foreground absolute"
                                style={{ left: `${(min / 90) * 100}%` }}
                              >
                                {min}&apos;
                              </span>
                            ))}
                          </div>

                          {/* Event markers */}
                          {mockMatchEvents.map((event) => {
                            const posPercent =
                              (event.timestamp / totalDuration) * 100;
                            return (
                              <button
                                key={event.id}
                                onClick={() => setCurrentTime(event.timestamp)}
                                className={cn(
                                  "absolute top-1 h-6 w-2 rounded-sm transition-all hover:scale-125 cursor-pointer",
                                  getEventColor(event.type)
                                )}
                                style={{ left: `${posPercent}%` }}
                                title={`${event.type}: ${event.description}`}
                              />
                            );
                          })}

                          {/* Playhead */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                            style={{
                              left: `${(currentTime / totalDuration) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-3">
                          {[
                            { type: "goal", label: "Goal" },
                            { type: "shot", label: "Shot" },
                            { type: "foul", label: "Foul" },
                            { type: "card", label: "Card" },
                            { type: "save", label: "Save" },
                            { type: "corner", label: "Corner" },
                            { type: "tackle", label: "Tackle" },
                          ].map((item) => (
                            <div key={item.type} className="flex items-center gap-1">
                              <div
                                className={cn(
                                  "h-2.5 w-2.5 rounded-sm",
                                  getEventColor(item.type)
                                )}
                              />
                              <span className="text-[10px] text-muted-foreground">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Statistics */}
                <TabsContent value="statistics">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">62%</p>
                        <p className="text-xs text-muted-foreground">Possession</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">487</p>
                        <p className="text-xs text-muted-foreground">Passes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">18</p>
                        <p className="text-xs text-muted-foreground">Shots</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-xs text-muted-foreground">Fouls</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">89%</p>
                        <p className="text-xs text-muted-foreground">Pass Accuracy</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">7</p>
                        <p className="text-xs text-muted-foreground">Corners</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-500">8</p>
                        <p className="text-xs text-muted-foreground">Shots on Target</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-500">2</p>
                        <p className="text-xs text-muted-foreground">Yellow Cards</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Formations */}
                <TabsContent value="formations">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        Formation: {mockFormations[0].name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-[2/1.2] bg-green-800 rounded-lg border-2 border-white/30 overflow-hidden">
                        {/* Field lines */}
                        <div className="absolute inset-0">
                          {/* Center line */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
                          {/* Center circle */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/30" />
                          {/* Penalty areas */}
                          <div className="absolute left-0 top-1/4 bottom-1/4 w-[15%] border-r border-t border-b border-white/30" />
                          <div className="absolute right-0 top-1/4 bottom-1/4 w-[15%] border-l border-t border-b border-white/30" />
                        </div>

                        {/* Player dots */}
                        {mockFormations[0].positions.map((pos, idx) => {
                          const player = mockPlayers.find(
                            (p) => p.id === pos.playerId
                          );
                          return (
                            <div
                              key={idx}
                              className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                              style={{
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                              }}
                            >
                              <div className="h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold">
                                  {player?.jerseyNumber ?? ""}
                                </span>
                              </div>
                              <span className="text-[8px] text-white/80 mt-0.5 font-medium whitespace-nowrap">
                                {pos.role}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right sidebar toggle */}
        <button
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          className="flex items-center justify-center w-5 border-l bg-muted/50 hover:bg-muted transition-colors"
        >
          {showRightSidebar ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* ================================================================ */}
        {/* RIGHT SIDEBAR                                                    */}
        {/* ================================================================ */}
        {showRightSidebar && (
          <aside className="w-80 border-l bg-card flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Processing Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Processing Status</Label>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        getStatusColor()
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          isAnalyzing
                            ? "bg-yellow-500 animate-pulse"
                            : progress === 100
                            ? "bg-green-500"
                            : "bg-gray-400"
                        )}
                      />
                      {getStatusLabel()}
                    </span>
                  </div>

                  <Progress value={progress} className="h-2" />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress}% complete</span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatTime(elapsedTime)}
                    </span>
                  </div>

                  {isAnalyzing && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleCancelAnalysis}
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Live Detection Feed */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    Live Detection Feed
                  </Label>
                  <div
                    ref={feedRef}
                    className="space-y-1.5 max-h-52 overflow-y-auto pr-1"
                  >
                    {mockDetectionFeed.map((detection) => (
                      <div
                        key={detection.id}
                        className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs"
                      >
                        <span className="font-mono text-muted-foreground min-w-[36px]">
                          {detection.timestamp}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold truncate">
                              {detection.playerName}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              #{detection.playerNumber}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{detection.eventType}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] px-1.5",
                            detection.confidence >= 95
                              ? "bg-green-500/20 text-green-600"
                              : detection.confidence >= 90
                              ? "bg-yellow-500/20 text-yellow-600"
                              : "bg-orange-500/20 text-orange-600"
                          )}
                        >
                          {detection.confidence}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Performance Metrics Dashboard */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    Performance Metrics
                  </Label>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Distance Covered */}
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-lg font-bold">
                          {performanceMetrics.distanceCovered.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Distance ({performanceMetrics.distanceCovered.unit})
                        </p>
                      </CardContent>
                    </Card>

                    {/* Sprint Count */}
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-lg font-bold">
                          {performanceMetrics.sprintCount.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Sprint Count</p>
                      </CardContent>
                    </Card>

                    {/* Top Speed */}
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-lg font-bold flex items-baseline gap-1">
                          {performanceMetrics.topSpeed.value}
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {performanceMetrics.topSpeed.unit}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">Top Speed</p>
                      </CardContent>
                    </Card>

                    {/* Shots */}
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-lg font-bold">
                          {performanceMetrics.shotsOnTarget.value}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{performanceMetrics.shotsOnTarget.total}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">Shots on Target</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Possession bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Possession</span>
                      <span className="text-xs font-bold text-primary">
                        {performanceMetrics.possession.value}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${performanceMetrics.possession.value}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pass Accuracy bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Pass Accuracy</span>
                      <span className="text-xs font-bold text-green-500">
                        {performanceMetrics.passAccuracy.value}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{
                          width: `${performanceMetrics.passAccuracy.value}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Heat Map Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" />
                    Heat Map Preview
                  </Label>
                  <div className="relative aspect-[1.6/1] bg-green-800 rounded-lg border border-white/20 overflow-hidden">
                    {/* Field lines */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20" />

                    {/* Heat map dots */}
                    {mockHeatMapData.map((point, idx) => (
                      <div
                        key={idx}
                        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                          width: `${8 + point.intensity * 8}px`,
                          height: `${8 + point.intensity * 8}px`,
                          backgroundColor:
                            point.intensity > 0.8
                              ? "rgba(239, 68, 68, 0.7)"
                              : point.intensity > 0.6
                              ? "rgba(249, 115, 22, 0.6)"
                              : point.intensity > 0.4
                              ? "rgba(234, 179, 8, 0.5)"
                              : "rgba(34, 197, 94, 0.4)",
                          opacity: 0.3 + point.intensity * 0.7,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Key Moments */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Key Moments</Label>
                  <div className="space-y-1.5">
                    {mockKeyMoments.map((moment) => (
                      <div
                        key={moment.id}
                        className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                      >
                        <Badge
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 mt-0.5",
                            getEventColor(moment.type),
                            "text-white"
                          )}
                        >
                          {formatTime(moment.timestamp)}
                        </Badge>
                        <p className="text-xs flex-1">{moment.description}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          onClick={() => setCurrentTime(moment.timestamp)}
                        >
                          Jump to
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Quick Actions</Label>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                      Generate Highlight Reel
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Download className="h-4 w-4 mr-2 text-blue-500" />
                      Export Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Share2 className="h-4 w-4 mr-2 text-green-500" />
                      Share Results
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </AppLayout>
  );
}
