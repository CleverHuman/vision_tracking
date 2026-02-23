"use client";

import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useMatches } from "@/hooks";
import type { Match, MatchResult } from "@/types";
import { formatDate, cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Share2,
  Trophy,
  Target,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  Shield,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortField =
  | "date"
  | "competition"
  | "homeTeam"
  | "score"
  | "venue"
  | "analysisCompletion";
type SortDirection = "asc" | "desc";
type HomeAwayFilter = "all" | "home" | "away";
type ViewMode = "table" | "season-comparison";

const ITEMS_PER_PAGE = 6;

const TEAM_NAME = "Arsenal";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isHome(match: Match): boolean {
  return match.homeTeam === TEAM_NAME;
}

function teamGoals(match: Match): number {
  return isHome(match) ? match.homeScore : match.awayScore;
}

function opponentGoals(match: Match): number {
  return isHome(match) ? match.awayScore : match.homeScore;
}

function resultColor(result: MatchResult): string {
  switch (result) {
    case "win":
      return "text-emerald-500";
    case "loss":
      return "text-red-500";
    case "draw":
      return "text-amber-500";
  }
}

function competitionBadgeVariant(
  competition: string
): "default" | "secondary" | "info" | "warning" | "sport" | "outline" {
  if (competition.includes("Premier")) return "default";
  if (competition.includes("Champions")) return "info";
  if (competition.includes("FA Cup")) return "warning";
  return "secondary";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  // -- state ----------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState<"all" | MatchResult>("all");
  const [homeAwayFilter, setHomeAwayFilter] = useState<HomeAwayFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const { data: matches, isLoading } = useMatches({}, 50);

  // -- derived data ---------------------------------------------------------

  const soccerMatches = useMemo(
    () => (matches ?? []).filter((m) => m.sport === "soccer"),
    [matches]
  );

  const filteredMatches = useMemo(() => {
    let result = [...soccerMatches];

    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.competition.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q)
      );
    }

    // competition
    if (competitionFilter !== "all") {
      result = result.filter((m) => m.competition === competitionFilter);
    }

    // result
    if (resultFilter !== "all") {
      result = result.filter((m) => m.result === resultFilter);
    }

    // home/away
    if (homeAwayFilter === "home") {
      result = result.filter((m) => isHome(m));
    } else if (homeAwayFilter === "away") {
      result = result.filter((m) => !isHome(m));
    }

    // date range
    if (dateFrom) {
      result = result.filter((m) => m.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((m) => m.date <= dateTo);
    }

    // sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = a.date.localeCompare(b.date);
          break;
        case "competition":
          cmp = a.competition.localeCompare(b.competition);
          break;
        case "homeTeam":
          cmp = a.homeTeam.localeCompare(b.homeTeam);
          break;
        case "score": {
          const aTotal = a.homeScore + a.awayScore;
          const bTotal = b.homeScore + b.awayScore;
          cmp = aTotal - bTotal;
          break;
        }
        case "venue":
          cmp = a.venue.localeCompare(b.venue);
          break;
        case "analysisCompletion":
          cmp = a.analysisCompletion - b.analysisCompletion;
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
    soccerMatches,
    searchQuery,
    competitionFilter,
    resultFilter,
    homeAwayFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
  ]);

  // -- stats ----------------------------------------------------------------

  const totalMatches = filteredMatches.length;
  const wins = filteredMatches.filter((m) => m.result === "win").length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const goalsScored = filteredMatches.reduce((s, m) => s + teamGoals(m), 0);
  const cleanSheets = filteredMatches.filter((m) => opponentGoals(m) === 0).length;

  // -- pagination -----------------------------------------------------------

  const totalPages = Math.max(1, Math.ceil(totalMatches / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMatches = filteredMatches.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );
  const showingFrom = totalMatches === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + ITEMS_PER_PAGE, totalMatches);

  // -- handlers -------------------------------------------------------------

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchQuery("");
    setCompetitionFilter("all");
    setResultFilter("all");
    setHomeAwayFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  // -- season comparison data -----------------------------------------------

  const season1Label = "2025/26 (Current)";
  const season2Label = "2024/25 (Previous)";

  // Simulated comparison stats
  const seasonComparison = {
    current: {
      matches: soccerMatches.length,
      wins,
      winRate,
      goalsScored,
      goalsConceded: soccerMatches.reduce((s, m) => s + opponentGoals(m), 0),
      cleanSheets,
      avgPossession: Math.round(
        soccerMatches.reduce((s, m) => s + (m.keyMetrics.possession ?? 0), 0) /
          soccerMatches.length
      ),
    },
    previous: {
      matches: 38,
      wins: 28,
      winRate: 74,
      goalsScored: 91,
      goalsConceded: 29,
      cleanSheets: 18,
      avgPossession: 57,
    },
  };

  // -- render ---------------------------------------------------------------

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
      <div className="flex-1 space-y-6 p-6">
        {/* ================================================================ */}
        {/* PAGE HEADER                                                      */}
        {/* ================================================================ */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Match History</h1>
            <p className="text-muted-foreground">
              Comprehensive match database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Table
            </Button>
            <Button
              variant={viewMode === "season-comparison" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("season-comparison")}
            >
              <TrendingUp className="mr-1 h-4 w-4" />
              Season Comparison
            </Button>
            <Button variant="sport" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* FILTERS BAR                                                      */}
        {/* ================================================================ */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Row 1 */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by match name, player, competition..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>

                {/* Date from */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-[150px]"
                    placeholder="From"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-[150px]"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Competition */}
                <Select
                  value={competitionFilter}
                  onValueChange={(v) => {
                    setCompetitionFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <Trophy className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Competition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Competitions</SelectItem>
                    <SelectItem value="Premier League">
                      Premier League
                    </SelectItem>
                    <SelectItem value="Champions League">
                      Champions League
                    </SelectItem>
                    <SelectItem value="FA Cup">FA Cup</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>

                {/* Result */}
                <Select
                  value={resultFilter}
                  onValueChange={(v) => {
                    setResultFilter(v as "all" | MatchResult);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <Target className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="draw">Draw</SelectItem>
                  </SelectContent>
                </Select>

                {/* Home / Away toggle */}
                <div className="flex items-center rounded-md border border-input">
                  <Button
                    variant={homeAwayFilter === "all" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => {
                      setHomeAwayFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={homeAwayFilter === "home" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none border-x border-input"
                    onClick={() => {
                      setHomeAwayFilter("home");
                      setCurrentPage(1);
                    }}
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    Home
                  </Button>
                  <Button
                    variant={homeAwayFilter === "away" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => {
                      setHomeAwayFilter("away");
                      setCurrentPage(1);
                    }}
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    Away
                  </Button>
                </div>

                {/* Clear Filters */}
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <Filter className="mr-1 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* SUMMARY STATS ROW                                                */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Matches
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Win Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {winRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Goals Scored
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalsScored}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clean Sheets
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cleanSheets}</div>
            </CardContent>
          </Card>
        </div>

        {/* ================================================================ */}
        {/* MAIN VIEW                                                        */}
        {/* ================================================================ */}
        {viewMode === "table" ? (
          <>
            {/* ============================================================ */}
            {/* MATCH TABLE                                                  */}
            {/* ============================================================ */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <SortableHeader
                          label="Match"
                          field="homeTeam"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Competition"
                          field="competition"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Score"
                          field="score"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Date"
                          field="date"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Venue"
                          field="venue"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Analysis %"
                          field="analysisCompletion"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Key Metrics
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMatches.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-12 text-center text-muted-foreground"
                          >
                            No matches found. Try adjusting your filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedMatches.map((match, idx) => (
                          <tr
                            key={match.id}
                            className={cn(
                              "border-b transition-colors hover:bg-muted/30",
                              idx % 2 === 1 && "bg-muted/10"
                            )}
                          >
                            {/* Match */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {/* thumbnail placeholder */}
                                <div className="h-8 w-12 flex-shrink-0 rounded bg-muted" />
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {match.homeTeam} vs {match.awayTeam}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {isHome(match) ? "Home" : "Away"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Competition */}
                            <td className="px-4 py-3">
                              <Badge
                                variant={competitionBadgeVariant(
                                  match.competition
                                )}
                              >
                                {match.competition}
                              </Badge>
                            </td>

                            {/* Score */}
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "font-bold",
                                  resultColor(match.result)
                                )}
                              >
                                {match.homeScore} - {match.awayScore}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3 text-muted-foreground">
                              {formatDate(match.date)}
                            </td>

                            {/* Venue */}
                            <td className="px-4 py-3 text-muted-foreground">
                              {match.venue}
                            </td>

                            {/* Analysis % */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={match.analysisCompletion}
                                  className="h-2 w-20"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {match.analysisCompletion}%
                                </span>
                              </div>
                            </td>

                            {/* Key Metrics */}
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {match.keyMetrics.possession !== undefined && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Poss {match.keyMetrics.possession}%
                                  </Badge>
                                )}
                                {match.keyMetrics.shots !== undefined && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Shots {match.keyMetrics.shots}
                                  </Badge>
                                )}
                                {match.keyMetrics.shotsOnTarget !== undefined && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    On Tgt{" "}
                                    {match.keyMetrics.shotsOnTarget}
                                  </Badge>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Re-analyze"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Export"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Share"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* ============================================================ */}
            {/* PAGINATION                                                   */}
            {/* ============================================================ */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing {showingFrom}-{showingTo} of {totalMatches} matches
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === safeCurrentPage ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* ================================================================ */
          /* SEASON COMPARISON VIEW                                          */
          /* ================================================================ */
          <Card>
            <CardHeader>
              <CardTitle>Season Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Current season */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{season1Label}</h3>
                  <SeasonStatRow
                    label="Matches Played"
                    value={seasonComparison.current.matches}
                    max={38}
                  />
                  <SeasonStatRow
                    label="Wins"
                    value={seasonComparison.current.wins}
                    max={38}
                    color="bg-emerald-500"
                  />
                  <SeasonStatRow
                    label="Win Rate"
                    value={seasonComparison.current.winRate}
                    max={100}
                    suffix="%"
                    color="bg-emerald-500"
                  />
                  <SeasonStatRow
                    label="Goals Scored"
                    value={seasonComparison.current.goalsScored}
                    max={100}
                    color="bg-blue-500"
                  />
                  <SeasonStatRow
                    label="Goals Conceded"
                    value={seasonComparison.current.goalsConceded}
                    max={100}
                    color="bg-red-500"
                  />
                  <SeasonStatRow
                    label="Clean Sheets"
                    value={seasonComparison.current.cleanSheets}
                    max={38}
                    color="bg-violet-500"
                  />
                  <SeasonStatRow
                    label="Avg Possession"
                    value={seasonComparison.current.avgPossession}
                    max={100}
                    suffix="%"
                    color="bg-amber-500"
                  />
                </div>

                {/* Previous season */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{season2Label}</h3>
                  <SeasonStatRow
                    label="Matches Played"
                    value={seasonComparison.previous.matches}
                    max={38}
                  />
                  <SeasonStatRow
                    label="Wins"
                    value={seasonComparison.previous.wins}
                    max={38}
                    color="bg-emerald-500"
                  />
                  <SeasonStatRow
                    label="Win Rate"
                    value={seasonComparison.previous.winRate}
                    max={100}
                    suffix="%"
                    color="bg-emerald-500"
                  />
                  <SeasonStatRow
                    label="Goals Scored"
                    value={seasonComparison.previous.goalsScored}
                    max={100}
                    color="bg-blue-500"
                  />
                  <SeasonStatRow
                    label="Goals Conceded"
                    value={seasonComparison.previous.goalsConceded}
                    max={100}
                    color="bg-red-500"
                  />
                  <SeasonStatRow
                    label="Clean Sheets"
                    value={seasonComparison.previous.cleanSheets}
                    max={38}
                    color="bg-violet-500"
                  />
                  <SeasonStatRow
                    label="Avg Possession"
                    value={seasonComparison.previous.avgPossession}
                    max={100}
                    suffix="%"
                    color="bg-amber-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const active = currentField === field;
  return (
    <th
      className="cursor-pointer select-none px-4 py-3 text-left font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3",
            active ? "text-foreground" : "text-muted-foreground/50"
          )}
        />
        {active && (
          <span className="text-[10px]">
            {direction === "asc" ? "\u2191" : "\u2193"}
          </span>
        )}
      </div>
    </th>
  );
}

function SeasonStatRow({
  label,
  value,
  max,
  suffix = "",
  color = "bg-primary",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  color?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
