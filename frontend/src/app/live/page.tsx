"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Radio,
  Play,
  Square,
  Camera,
  Monitor,
  Wifi,
  WifiOff,
  Activity,
  Users,
  Timer,
  Zap,
  Eye,
  BarChart3,
  Settings,
  Maximize,
  Volume2,
  Circle,
} from "lucide-react";

const mockLiveStats = {
  possession: { home: 58, away: 42 },
  shots: { home: 8, away: 5 },
  passes: { home: 342, away: 267 },
  fouls: { home: 6, away: 9 },
  corners: { home: 4, away: 2 },
  playersTracked: 22,
  fps: 30,
  latency: 45,
};

const mockLiveEvents = [
  { id: "1", time: "87:23", type: "shot", team: "Arsenal", player: "Saka", description: "Shot on target - saved by goalkeeper", color: "text-yellow-400" },
  { id: "2", time: "84:15", type: "foul", team: "Chelsea", player: "Palmer", description: "Foul committed - free kick awarded", color: "text-red-400" },
  { id: "3", time: "82:01", type: "substitution", team: "Arsenal", player: "Havertz → Nketiah", description: "Substitution", color: "text-blue-400" },
  { id: "4", time: "78:44", type: "corner", team: "Arsenal", player: "Saka", description: "Corner kick", color: "text-cyan-400" },
  { id: "5", time: "73:30", type: "goal", team: "Arsenal", player: "Saka", description: "GOAL! Arsenal take the lead!", color: "text-emerald-400" },
  { id: "6", time: "67:12", type: "card", team: "Chelsea", player: "Caicedo", description: "Yellow card for reckless challenge", color: "text-yellow-400" },
  { id: "7", time: "61:55", type: "shot", team: "Chelsea", player: "Jackson", description: "Shot wide from outside the box", color: "text-orange-400" },
  { id: "8", time: "56:20", type: "goal", team: "Chelsea", player: "Palmer", description: "GOAL! Chelsea equalize!", color: "text-emerald-400" },
  { id: "9", time: "45:00", type: "whistle", team: "", player: "", description: "Second half kick-off", color: "text-white" },
  { id: "10", time: "23:18", type: "goal", team: "Arsenal", player: "Odegaard", description: "GOAL! Brilliant free kick!", color: "text-emerald-400" },
];

export default function LiveAnalysisPage() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [matchTime, setMatchTime] = useState(87);
  const [autoTracking, setAutoTracking] = useState(true);
  const [instantReplay, setInstantReplay] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const connectionStatus: "connected" | "disconnected" | "connecting" = isLive ? "connected" : "disconnected";

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setMatchTime((prev) => Math.min(prev + 1, 90));
    }, 60000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center gap-2", isLive && "text-red-500")}>
              <Radio className={cn("h-5 w-5", isLive && "animate-pulse")} />
              <span className="font-bold text-lg">Live Analysis</span>
            </div>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse gap-1">
                <Circle className="h-2 w-2 fill-current" />
                LIVE
              </Badge>
            )}
            <Badge
              variant={isLive ? "success" : "secondary"}
              className="gap-1"
            >
              {isLive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isLive ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isLive ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsRecording(!isRecording)}>
                  <Circle className={cn("h-4 w-4", isRecording && "fill-red-500 text-red-500")} />
                  {isRecording ? "Recording" : "Record"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setIsLive(false)}>
                  <Square className="h-4 w-4" />
                  Stop Live
                </Button>
              </>
            ) : (
              <Button variant="sport" size="sm" onClick={() => setIsLive(true)}>
                <Play className="h-4 w-4" />
                Start Live Feed
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Video Area */}
          <div className="flex flex-1 flex-col">
            {/* Live Video Feed */}
            <div className="relative flex-1 bg-black flex items-center justify-center">
              {isLive ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
                  <div className="text-center">
                    <Monitor className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Live video feed active</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Camera feed streaming at {mockLiveStats.fps} FPS</p>
                  </div>
                  {/* Match overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/70 rounded-lg px-4 py-2 backdrop-blur-sm">
                      <span className="font-bold">Arsenal</span>
                      <span className="text-2xl font-bold text-emerald-400">2 - 1</span>
                      <span className="font-bold">Chelsea</span>
                    </div>
                    <Badge variant="destructive" className="bg-red-600">
                      <Timer className="h-3 w-3 mr-1" />
                      {matchTime}&apos;
                    </Badge>
                  </div>
                  {/* Tracking overlay indicators */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge variant="info" className="gap-1">
                      <Users className="h-3 w-3" />
                      {mockLiveStats.playersTracked} tracked
                    </Badge>
                    <Badge variant="info" className="gap-1">
                      <Activity className="h-3 w-3" />
                      {mockLiveStats.latency}ms
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white h-8 w-8">
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white h-8 w-8">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white h-8 w-8">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Radio className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No Live Feed Active</h3>
                  <p className="text-sm text-muted-foreground/60 mt-1 mb-4">Click &quot;Start Live Feed&quot; to begin real-time analysis</p>
                  <Button variant="sport" onClick={() => setIsLive(true)}>
                    <Play className="h-4 w-4" />
                    Start Live Feed
                  </Button>
                </div>
              )}
            </div>

            {/* Live Stats Bar */}
            <div className="border-t border-border bg-card px-6 py-3">
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Possession</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-400">{mockLiveStats.possession.home}%</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mockLiveStats.possession.home}%` }} />
                    </div>
                    <span className="text-sm font-bold text-red-400">{mockLiveStats.possession.away}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Shots</p>
                  <p className="text-sm font-bold">{mockLiveStats.shots.home} - {mockLiveStats.shots.away}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Passes</p>
                  <p className="text-sm font-bold">{mockLiveStats.passes.home} - {mockLiveStats.passes.away}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Fouls</p>
                  <p className="text-sm font-bold">{mockLiveStats.fouls.home} - {mockLiveStats.fouls.away}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Corners</p>
                  <p className="text-sm font-bold">{mockLiveStats.corners.home} - {mockLiveStats.corners.away}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Live Feed */}
          <div className="w-80 border-l border-border bg-card flex flex-col">
            {/* Settings */}
            <div className="border-b border-border p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Live Settings
              </h3>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Auto Tracking</Label>
                <Switch checked={autoTracking} onCheckedChange={setAutoTracking} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Instant Replay</Label>
                <Switch checked={instantReplay} onCheckedChange={setInstantReplay} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Heat Map</Label>
                <Switch checked={showHeatMap} onCheckedChange={setShowHeatMap} />
              </div>
            </div>

            {/* Connection info */}
            <div className="border-b border-border p-4">
              <h3 className="font-semibold text-sm mb-2">Connection</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">FPS</span>
                  <span className="font-medium">{isLive ? mockLiveStats.fps : "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Latency</span>
                  <span className={cn("font-medium", isLive && mockLiveStats.latency < 100 ? "text-emerald-400" : "text-yellow-400")}>
                    {isLive ? `${mockLiveStats.latency}ms` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Resolution</span>
                  <span className="font-medium">{isLive ? "1920×1080" : "—"}</span>
                </div>
              </div>
            </div>

            {/* Live Events Feed */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Live Events
                </h3>
                <Badge variant="outline" className="text-xs">{mockLiveEvents.length}</Badge>
              </div>
              <ScrollArea className="flex-1 px-4 pb-4">
                <div className="space-y-2">
                  {mockLiveEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-2 rounded-lg bg-secondary/30 p-2.5 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <span className="text-xs font-mono font-bold text-muted-foreground w-12 shrink-0 pt-0.5">{event.time}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-medium", event.color)}>{event.description}</p>
                        {event.player && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {event.team} &middot; {event.player}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-border p-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Camera className="h-4 w-4" />
                Capture Screenshot
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                Generate Instant Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
