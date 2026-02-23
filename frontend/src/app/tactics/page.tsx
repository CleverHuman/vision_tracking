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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Pencil,
  ArrowRight,
  Circle,
  Square,
  Eraser,
  Undo,
  Redo,
  Trash2,
  Save,
  Download,
  Share2,
  Target,
  Shield,
  Swords,
  Users,
  ChevronRight,
  Flag,
  Plus,
  ArrowUpRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Formation position data
// ---------------------------------------------------------------------------

type PlayerPosition = {
  x: number;
  y: number;
  role: string;
  number: number;
};

const formations: Record<string, { positions: PlayerPosition[]; description: string }> = {
  "4-3-3": {
    description:
      "Balanced formation with width in attack. Three forwards stretch the opposition defense while four defenders provide stability.",
    positions: [
      { x: 50, y: 92, role: "GK", number: 1 },
      { x: 15, y: 75, role: "LB", number: 3 },
      { x: 38, y: 78, role: "CB", number: 4 },
      { x: 62, y: 78, role: "CB", number: 5 },
      { x: 85, y: 75, role: "RB", number: 2 },
      { x: 30, y: 52, role: "CM", number: 8 },
      { x: 50, y: 55, role: "CDM", number: 6 },
      { x: 70, y: 52, role: "CM", number: 10 },
      { x: 15, y: 25, role: "LW", number: 11 },
      { x: 50, y: 20, role: "ST", number: 9 },
      { x: 85, y: 25, role: "RW", number: 7 },
    ],
  },
  "4-4-2": {
    description:
      "Classic formation providing a compact shape. Two banks of four make it defensively solid, with two strikers offering a direct goal threat.",
    positions: [
      { x: 50, y: 92, role: "GK", number: 1 },
      { x: 15, y: 75, role: "LB", number: 3 },
      { x: 38, y: 78, role: "CB", number: 4 },
      { x: 62, y: 78, role: "CB", number: 5 },
      { x: 85, y: 75, role: "RB", number: 2 },
      { x: 15, y: 50, role: "LM", number: 11 },
      { x: 38, y: 52, role: "CM", number: 8 },
      { x: 62, y: 52, role: "CM", number: 6 },
      { x: 85, y: 50, role: "RM", number: 7 },
      { x: 38, y: 22, role: "ST", number: 9 },
      { x: 62, y: 22, role: "ST", number: 10 },
    ],
  },
  "3-5-2": {
    description:
      "Three centre-backs with wing-backs providing width. Dominant in midfield with five players, ideal for controlling possession.",
    positions: [
      { x: 50, y: 92, role: "GK", number: 1 },
      { x: 25, y: 78, role: "CB", number: 3 },
      { x: 50, y: 80, role: "CB", number: 4 },
      { x: 75, y: 78, role: "CB", number: 5 },
      { x: 8, y: 55, role: "LWB", number: 11 },
      { x: 30, y: 52, role: "CM", number: 8 },
      { x: 50, y: 48, role: "CDM", number: 6 },
      { x: 70, y: 52, role: "CM", number: 10 },
      { x: 92, y: 55, role: "RWB", number: 2 },
      { x: 38, y: 22, role: "ST", number: 9 },
      { x: 62, y: 22, role: "ST", number: 7 },
    ],
  },
  "4-2-3-1": {
    description:
      "Modern formation with a double pivot shielding the defence. The number 10 links play behind a lone striker with wide attackers providing support.",
    positions: [
      { x: 50, y: 92, role: "GK", number: 1 },
      { x: 15, y: 75, role: "LB", number: 3 },
      { x: 38, y: 78, role: "CB", number: 4 },
      { x: 62, y: 78, role: "CB", number: 5 },
      { x: 85, y: 75, role: "RB", number: 2 },
      { x: 38, y: 58, role: "CDM", number: 6 },
      { x: 62, y: 58, role: "CDM", number: 8 },
      { x: 15, y: 38, role: "LAM", number: 11 },
      { x: 50, y: 35, role: "CAM", number: 10 },
      { x: 85, y: 38, role: "RAM", number: 7 },
      { x: 50, y: 18, role: "ST", number: 9 },
    ],
  },
  "3-4-3": {
    description:
      "Aggressive attacking formation with three forwards and wing-backs pushing high. Provides numerical superiority in the final third.",
    positions: [
      { x: 50, y: 92, role: "GK", number: 1 },
      { x: 25, y: 78, role: "CB", number: 3 },
      { x: 50, y: 80, role: "CB", number: 4 },
      { x: 75, y: 78, role: "CB", number: 5 },
      { x: 10, y: 52, role: "LWB", number: 11 },
      { x: 38, y: 55, role: "CM", number: 8 },
      { x: 62, y: 55, role: "CM", number: 6 },
      { x: 90, y: 52, role: "RWB", number: 2 },
      { x: 20, y: 25, role: "LW", number: 10 },
      { x: 50, y: 20, role: "ST", number: 9 },
      { x: 80, y: 25, role: "RW", number: 7 },
    ],
  },
  "5-3-2": {
    description:
      "Defensively robust with five at the back. Wing-backs overlap to provide width while three midfielders maintain control of the centre.",
    positions: [
      { x: 50, y: 92, role: "GK", number: 1 },
      { x: 8, y: 72, role: "LWB", number: 3 },
      { x: 28, y: 78, role: "CB", number: 4 },
      { x: 50, y: 80, role: "CB", number: 5 },
      { x: 72, y: 78, role: "CB", number: 6 },
      { x: 92, y: 72, role: "RWB", number: 2 },
      { x: 30, y: 52, role: "CM", number: 8 },
      { x: 50, y: 50, role: "CM", number: 10 },
      { x: 70, y: 52, role: "CM", number: 7 },
      { x: 38, y: 25, role: "ST", number: 9 },
      { x: 62, y: 25, role: "ST", number: 11 },
    ],
  },
};

// Away team positions (mirrored / offset)
const awayPositions: PlayerPosition[] = [
  { x: 50, y: 8, role: "GK", number: 1 },
  { x: 85, y: 25, role: "LB", number: 3 },
  { x: 62, y: 22, role: "CB", number: 4 },
  { x: 38, y: 22, role: "CB", number: 5 },
  { x: 15, y: 25, role: "RB", number: 2 },
  { x: 70, y: 45, role: "CM", number: 8 },
  { x: 50, y: 42, role: "CDM", number: 6 },
  { x: 30, y: 45, role: "CM", number: 10 },
  { x: 85, y: 68, role: "LW", number: 11 },
  { x: 50, y: 72, role: "ST", number: 9 },
  { x: 15, y: 68, role: "RW", number: 7 },
];

// Phase-specific position offsets
const phaseOffsets: Record<string, { dx: number; dy: number }> = {
  attack: { dx: 0, dy: -8 },
  defense: { dx: 0, dy: 8 },
  "transition-attack": { dx: 0, dy: -4 },
  "transition-defense": { dx: 0, dy: 4 },
};

// ---------------------------------------------------------------------------
// Passing network mock data
// ---------------------------------------------------------------------------

const passingNodes = [
  { id: 1, name: "Player 6", angle: 0 },
  { id: 2, name: "Player 8", angle: 60 },
  { id: 3, name: "Player 10", angle: 120 },
  { id: 4, name: "Player 9", angle: 180 },
  { id: 5, name: "Player 7", angle: 240 },
  { id: 6, name: "Player 11", angle: 300 },
];

const passingLinks = [
  { from: 0, to: 1, weight: 5 },
  { from: 0, to: 2, weight: 3 },
  { from: 1, to: 2, weight: 4 },
  { from: 1, to: 3, weight: 2 },
  { from: 2, to: 3, weight: 5 },
  { from: 2, to: 4, weight: 1 },
  { from: 3, to: 5, weight: 3 },
  { from: 4, to: 5, weight: 4 },
  { from: 0, to: 5, weight: 2 },
  { from: 1, to: 4, weight: 1 },
];

const topPassingCombinations = [
  { pair: "Player 6 - Player 10", count: 48, accuracy: 91 },
  { pair: "Player 10 - Player 9", count: 42, accuracy: 87 },
  { pair: "Player 8 - Player 10", count: 38, accuracy: 89 },
  { pair: "Player 11 - Player 7", count: 31, accuracy: 84 },
  { pair: "Player 6 - Player 8", count: 29, accuracy: 92 },
];

// ---------------------------------------------------------------------------
// Set piece mock data
// ---------------------------------------------------------------------------

const setPieces: Record<string, { id: string; name: string; type: string }[]> = {
  corners: [
    { id: "c1", name: "Near Post Flick", type: "corners" },
    { id: "c2", name: "Far Post Delivery", type: "corners" },
    { id: "c3", name: "Short Corner Routine", type: "corners" },
    { id: "c4", name: "Back Post Overload", type: "corners" },
  ],
  "free-kicks": [
    { id: "f1", name: "Direct Strike", type: "free-kicks" },
    { id: "f2", name: "Wall Pass Routine", type: "free-kicks" },
    { id: "f3", name: "Curved Delivery", type: "free-kicks" },
  ],
  "goal-kicks": [
    { id: "g1", name: "Short Build-up Left", type: "goal-kicks" },
    { id: "g2", name: "Long Ball to Target", type: "goal-kicks" },
    { id: "g3", name: "Diamond Build-up", type: "goal-kicks" },
  ],
  "throw-ins": [
    { id: "t1", name: "Long Throw to Box", type: "throw-ins" },
    { id: "t2", name: "Quick Overlap", type: "throw-ins" },
    { id: "t3", name: "Back to Keeper", type: "throw-ins" },
  ],
};

// ---------------------------------------------------------------------------
// Opponent analysis mock data
// ---------------------------------------------------------------------------

const opponentData = {
  name: "FC Rivals United",
  commonFormations: ["4-4-2", "4-2-3-1", "3-5-2"],
  strengths: [
    "Strong aerial presence from set pieces",
    "Fast counter-attacking transitions",
    "Experienced defensive midfield",
    "Disciplined low block in second half",
  ],
  weaknesses: [
    "Vulnerable to high press on goal kicks",
    "Left-back position prone to errors",
    "Slow centre-backs against pace",
    "Poor defensive transition after losing possession",
  ],
  dangerPlayers: [
    { name: "Marcus Silva", position: "ST", rating: 8.4 },
    { name: "James Okafor", position: "CAM", rating: 7.9 },
    { name: "Leo Vasquez", position: "RW", rating: 7.6 },
  ],
};

// ---------------------------------------------------------------------------
// Drawing tools and colors
// ---------------------------------------------------------------------------

const drawingTools = [
  { id: "line", label: "Line", icon: Pencil },
  { id: "arrow", label: "Arrow", icon: ArrowRight },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "freedraw", label: "Free Draw", icon: Square },
] as const;

const drawingColors = [
  { id: "red", color: "#ef4444", label: "Red" },
  { id: "blue", color: "#3b82f6", label: "Blue" },
  { id: "yellow", color: "#eab308", label: "Yellow" },
  { id: "white", color: "#ffffff", label: "White" },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function TacticsPage() {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [activePhase, setActivePhase] = useState("attack");
  const [drawingTool, setDrawingTool] = useState<string | null>(null);
  const [drawingColor, setDrawingColor] = useState("red");
  const [selectedSetPieceTab, setSelectedSetPieceTab] = useState("corners");
  const [pressingStyle, setPressingStyle] = useState("high");
  const [showPassingNetwork, setShowPassingNetwork] = useState(true);

  const currentFormation = formations[selectedFormation];
  const offset = phaseOffsets[activePhase] ?? { dx: 0, dy: 0 };

  // Compute player positions with phase offset
  const homePlayerPositions = currentFormation.positions.map((p) => ({
    ...p,
    x: Math.min(100, Math.max(0, p.x + offset.dx)),
    y: Math.min(100, Math.max(0, p.y + offset.dy)),
  }));

  // Passing network node positions (circle layout)
  const networkRadius = 38;
  const networkCenter = { x: 50, y: 50 };
  const networkNodePositions = passingNodes.map((node) => {
    const rad = (node.angle * Math.PI) / 180;
    return {
      ...node,
      cx: networkCenter.x + networkRadius * Math.cos(rad),
      cy: networkCenter.y + networkRadius * Math.sin(rad),
    };
  });

  // Pressing line height
  const pressLineY =
    pressingStyle === "high" ? 30 : pressingStyle === "mid" ? 50 : 70;
  const pressingIntensity =
    pressingStyle === "high" ? 82 : pressingStyle === "mid" ? 58 : 34;
  const ppdaValue =
    pressingStyle === "high"
      ? "7.2"
      : pressingStyle === "mid"
        ? "11.5"
        : "16.8";

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tactical Analysis
            </h1>
            <p className="text-sm text-muted-foreground">
              Plan formations, analyze patterns, and prepare match strategies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="sport">Match Day Prep</Badge>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ============================================================= */}
          {/* LEFT SIDE (2/3 width)                                         */}
          {/* ============================================================= */}
          <div className="space-y-6 lg:col-span-2">
            {/* -----------------------------------------------------------
                Drawing Toolbar
            ----------------------------------------------------------- */}
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Tool buttons */}
                  {drawingTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Button
                        key={tool.id}
                        variant={drawingTool === tool.id ? "sport" : "outline"}
                        size="sm"
                        onClick={() =>
                          setDrawingTool(
                            drawingTool === tool.id ? null : tool.id
                          )
                        }
                      >
                        <Icon className="h-4 w-4" />
                        {tool.label}
                      </Button>
                    );
                  })}

                  <Separator orientation="vertical" className="mx-1 h-6" />

                  {/* Color selector */}
                  {drawingColors.map((c) => (
                    <button
                      key={c.id}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                        drawingColor === c.id
                          ? "border-foreground scale-110"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: c.color }}
                      onClick={() => setDrawingColor(c.id)}
                      title={c.label}
                    />
                  ))}

                  <Separator orientation="vertical" className="mx-1 h-6" />

                  {/* Actions */}
                  <Button variant="ghost" size="sm">
                    <Undo className="h-4 w-4" />
                    Undo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Redo className="h-4 w-4" />
                    Redo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Interactive Tactical Board
            ----------------------------------------------------------- */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  className={cn(
                    "tactical-grid relative aspect-[3/2] w-full overflow-hidden bg-emerald-700",
                    drawingTool && "cursor-crosshair"
                  )}
                >
                  {/* Field markings */}

                  {/* Outer boundary */}
                  <div className="absolute inset-[4%] border-2 border-white/60" />

                  {/* Center line */}
                  <div className="absolute left-[4%] right-[4%] top-1/2 h-0 -translate-y-px border-t-2 border-white/60" />

                  {/* Center circle */}
                  <div className="absolute left-1/2 top-1/2 h-[18%] w-[12%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60" />

                  {/* Center spot */}
                  <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />

                  {/* Top penalty box */}
                  <div className="absolute left-1/2 top-[4%] h-[18%] w-[44%] -translate-x-1/2 border-2 border-t-0 border-white/60" />

                  {/* Top goal area (6-yard box) */}
                  <div className="absolute left-1/2 top-[4%] h-[8%] w-[20%] -translate-x-1/2 border-2 border-t-0 border-white/60" />

                  {/* Top penalty spot */}
                  <div className="absolute left-1/2 top-[16%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80" />

                  {/* Bottom penalty box */}
                  <div className="absolute bottom-[4%] left-1/2 h-[18%] w-[44%] -translate-x-1/2 border-2 border-b-0 border-white/60" />

                  {/* Bottom goal area (6-yard box) */}
                  <div className="absolute bottom-[4%] left-1/2 h-[8%] w-[20%] -translate-x-1/2 border-2 border-b-0 border-white/60" />

                  {/* Bottom penalty spot */}
                  <div className="absolute bottom-[16%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80" />

                  {/* Corner arcs (tiny quarter-circles) */}
                  <div className="absolute left-[4%] top-[4%] h-[3%] w-[2%] rounded-br-full border-b-2 border-r-2 border-white/60" />
                  <div className="absolute right-[4%] top-[4%] h-[3%] w-[2%] rounded-bl-full border-b-2 border-l-2 border-white/60" />
                  <div className="absolute bottom-[4%] left-[4%] h-[3%] w-[2%] rounded-tr-full border-r-2 border-t-2 border-white/60" />
                  <div className="absolute bottom-[4%] right-[4%] h-[3%] w-[2%] rounded-tl-full border-l-2 border-t-2 border-white/60" />

                  {/* Home team players (blue) */}
                  {homePlayerPositions.map((player, idx) => (
                    <div
                      key={`home-${idx}`}
                      className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-white bg-blue-600 text-[10px] font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:cursor-grabbing"
                      style={{
                        left: `${player.x}%`,
                        top: `${player.y}%`,
                      }}
                      title={`${player.role} (#${player.number})`}
                    >
                      {player.number}
                    </div>
                  ))}

                  {/* Away team players (red) */}
                  {awayPositions.map((player, idx) => (
                    <div
                      key={`away-${idx}`}
                      className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:cursor-grabbing"
                      style={{
                        left: `${player.x}%`,
                        top: `${player.y}%`,
                      }}
                      title={`${player.role} (#${player.number})`}
                    >
                      {player.number}
                    </div>
                  ))}

                  {/* Ball */}
                  <div
                    className="absolute z-20 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border border-gray-400 bg-yellow-300 shadow-md active:cursor-grabbing"
                    style={{ left: "50%", top: "50%" }}
                    title="Ball"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Formation Selector
            ----------------------------------------------------------- */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Formation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(formations).map((f) => (
                    <Button
                      key={f}
                      variant={selectedFormation === f ? "sport" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFormation(f)}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentFormation.description}
                </p>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Phase of Play Tabs
            ----------------------------------------------------------- */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Phase of Play</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activePhase}
                  onValueChange={setActivePhase}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="attack" className="flex-1 gap-1.5">
                      <Swords className="h-3.5 w-3.5" />
                      Attack
                    </TabsTrigger>
                    <TabsTrigger value="defense" className="flex-1 gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Defense
                    </TabsTrigger>
                    <TabsTrigger
                      value="transition-attack"
                      className="flex-1 gap-1.5"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Trans. (Att)
                    </TabsTrigger>
                    <TabsTrigger
                      value="transition-defense"
                      className="flex-1 gap-1.5"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Trans. (Def)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="attack" className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Players push forward into attacking positions. Full-backs
                      overlap, wingers stretch wide, and midfielders advance
                      into the final third.
                    </p>
                  </TabsContent>
                  <TabsContent value="defense" className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Compact defensive shape. Players drop deeper, maintain
                      narrow lines, and close passing lanes between the lines.
                    </p>
                  </TabsContent>
                  <TabsContent value="transition-attack" className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Moment of winning possession. Quick forward passes, runs
                      in behind, and exploiting disorganized defensive shape.
                    </p>
                  </TabsContent>
                  <TabsContent value="transition-defense" className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Moment of losing possession. Immediate counter-press or
                      recovery runs to regain defensive structure.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ============================================================= */}
          {/* RIGHT SIDE (1/3 width)                                        */}
          {/* ============================================================= */}
          <div className="space-y-6">
            {/* -----------------------------------------------------------
                Passing Network Panel
            ----------------------------------------------------------- */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Passing Network</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassingNetwork(!showPassingNetwork)}
                  >
                    {showPassingNetwork ? "Hide" : "Show"}
                  </Button>
                </div>
              </CardHeader>
              {showPassingNetwork && (
                <CardContent className="space-y-4">
                  {/* Network visualization */}
                  <div className="relative aspect-square w-full rounded-lg bg-muted/50 p-2">
                    <svg
                      viewBox="0 0 100 100"
                      className="h-full w-full"
                    >
                      {/* Links */}
                      {passingLinks.map((link, idx) => {
                        const from = networkNodePositions[link.from];
                        const to = networkNodePositions[link.to];
                        return (
                          <line
                            key={`link-${idx}`}
                            x1={from.cx}
                            y1={from.cy}
                            x2={to.cx}
                            y2={to.cy}
                            stroke="hsl(var(--foreground))"
                            strokeOpacity={0.3}
                            strokeWidth={link.weight * 0.4}
                          />
                        );
                      })}
                      {/* Nodes */}
                      {networkNodePositions.map((node, idx) => (
                        <g key={`node-${idx}`}>
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={4}
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth={1}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + 8}
                            textAnchor="middle"
                            fontSize={3.5}
                            fill="hsl(var(--muted-foreground))"
                          >
                            {node.name}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-0.5 w-5 bg-foreground/60" />
                      Occasional
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-1 w-5 bg-foreground/60" />
                      Frequent
                    </span>
                  </div>

                  <Separator />

                  {/* Top passing combinations */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Top Passing Combinations
                    </h4>
                    {topPassingCombinations.map((combo, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {idx + 1}.
                          </span>
                          <span className="text-sm">{combo.pair}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {combo.count} passes
                          </Badge>
                          <Badge variant="success" className="text-[10px]">
                            {combo.accuracy}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* -----------------------------------------------------------
                Pressing Triggers Panel
            ----------------------------------------------------------- */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pressing Triggers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Toggle: High Press / Mid Block / Low Block */}
                <div className="flex gap-2">
                  {(
                    [
                      { key: "high", label: "High Press" },
                      { key: "mid", label: "Mid Block" },
                      { key: "low", label: "Low Block" },
                    ] as const
                  ).map((style) => (
                    <Button
                      key={style.key}
                      variant={
                        pressingStyle === style.key ? "sport" : "outline"
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() => setPressingStyle(style.key)}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>

                {/* Mini field with press line */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-emerald-700/80">
                  {/* Mini field outline */}
                  <div className="absolute inset-[6%] border border-white/40" />
                  {/* Center line */}
                  <div className="absolute left-[6%] right-[6%] top-1/2 border-t border-white/40" />

                  {/* Press line indicator */}
                  <div
                    className="absolute left-[6%] right-[6%] border-t-2 border-dashed border-yellow-400 transition-all duration-500"
                    style={{ top: `${pressLineY}%` }}
                  />
                  <div
                    className="absolute right-[8%] -translate-y-1/2 text-[10px] font-bold text-yellow-400 transition-all duration-500"
                    style={{ top: `${pressLineY}%` }}
                  >
                    Press Line
                  </div>

                  {/* Shaded area above press line */}
                  <div
                    className="absolute left-[6%] right-[6%] top-[6%] bg-yellow-400/10 transition-all duration-500"
                    style={{ height: `${pressLineY - 6}%` }}
                  />
                </div>

                {/* Pressing intensity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Pressing Intensity
                    </span>
                    <span className="font-semibold">{pressingIntensity}%</span>
                  </div>
                  <Progress
                    value={pressingIntensity}
                    className="h-2 bg-emerald-500/20 [&>[data-state]]:bg-emerald-500"
                  />
                </div>

                {/* PPDA */}
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      PPDA (Passes Per Defensive Action)
                    </p>
                    <p className="text-lg font-bold">{ppdaValue}</p>
                  </div>
                  <Target className="h-5 w-5 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Set Piece Library
            ----------------------------------------------------------- */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Set Piece Library
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                    Add New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={selectedSetPieceTab}
                  onValueChange={setSelectedSetPieceTab}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="corners" className="flex-1">
                      Corners
                    </TabsTrigger>
                    <TabsTrigger value="free-kicks" className="flex-1">
                      Free Kicks
                    </TabsTrigger>
                    <TabsTrigger value="goal-kicks" className="flex-1">
                      Goal Kicks
                    </TabsTrigger>
                    <TabsTrigger value="throw-ins" className="flex-1">
                      Throw-ins
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(setPieces).map(([key, routines]) => (
                    <TabsContent key={key} value={key}>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2 pr-2">
                          {routines.map((routine) => (
                            <div
                              key={routine.id}
                              className="group flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                            >
                              {/* Mini preview placeholder */}
                              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-emerald-700/40">
                                <Flag className="h-3.5 w-3.5 text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {routine.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {key.replace("-", " ")}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Opponent Analysis
            ----------------------------------------------------------- */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Opponent Analysis
                  </CardTitle>
                  <Badge variant="warning">{opponentData.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Common formations */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Common Formations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {opponentData.commonFormations.map((f) => (
                      <Badge key={f} variant="secondary">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Strengths */}
                <div className="space-y-1.5">
                  <h4 className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                    <Shield className="h-3.5 w-3.5" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {opponentData.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="space-y-1.5">
                  <h4 className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                    <Target className="h-3.5 w-3.5" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {opponentData.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Danger players */}
                <div className="space-y-2">
                  <h4 className="flex items-center gap-1.5 text-sm font-medium">
                    <Users className="h-3.5 w-3.5" />
                    Danger Players
                  </h4>
                  {opponentData.dangerPlayers.map((player, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{player.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {player.position}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="warning"
                        className="text-xs font-bold"
                      >
                        {player.rating}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Actions
            ----------------------------------------------------------- */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <Button variant="sport" className="w-full">
                    <Save className="h-4 w-4" />
                    Save Formation
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4" />
                    Export Tactics
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4" />
                    Share with Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
