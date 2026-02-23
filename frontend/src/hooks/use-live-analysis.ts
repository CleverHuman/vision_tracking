import { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { MatchEvent, HeatMapPoint } from "@/types";

interface LiveAnalysisState {
  isConnected: boolean;
  progress: number;
  events: MatchEvent[];
  trackingData: Array<{
    playerId: string;
    x: number;
    y: number;
    speed: number;
  }>;
  heatmapPoints: HeatMapPoint[];
  status: "idle" | "connecting" | "active" | "completed" | "error";
  error: string | null;
}

const initialState: LiveAnalysisState = {
  isConnected: false,
  progress: 0,
  events: [],
  trackingData: [],
  heatmapPoints: [],
  status: "idle",
  error: null,
};

export function useLiveAnalysis(jobId: string | null) {
  const [state, setState] = useState<LiveAnalysisState>(initialState);
  const jobIdRef = useRef(jobId);

  // Keep ref in sync via effect
  useEffect(() => {
    jobIdRef.current = jobId;
  }, [jobId]);

  const joinSession = useCallback(() => {
    if (!jobIdRef.current) return;

    setState((s) => ({ ...s, status: "connecting" }));

    const socket = connectSocket();

    socket.on("connect", () => {
      setState((s) => ({ ...s, isConnected: true, status: "active" }));
      socket.emit("join_session", { jobId: jobIdRef.current });
    });

    socket.on("disconnect", () => {
      setState((s) => ({ ...s, isConnected: false }));
    });

    socket.on("analysis_progress", (data: { jobId: string; progress: number }) => {
      if (data.jobId === jobIdRef.current) {
        setState((s) => ({ ...s, progress: data.progress }));
      }
    });

    socket.on(
      "tracking_update",
      (data: {
        jobId: string;
        players: Array<{ playerId: string; x: number; y: number; speed: number }>;
      }) => {
        if (data.jobId === jobIdRef.current) {
          setState((s) => ({ ...s, trackingData: data.players }));
        }
      }
    );

    socket.on(
      "event_detected",
      (data: {
        jobId: string;
        event: {
          id: string;
          type: string;
          timestamp: number;
          player?: string;
          team: string;
          description: string;
          position?: { x: number; y: number };
        };
      }) => {
        if (data.jobId === jobIdRef.current) {
          setState((s) => ({
            ...s,
            events: [
              ...s.events,
              {
                id: data.event.id,
                type: data.event.type as MatchEvent["type"],
                timestamp: data.event.timestamp,
                player: data.event.player,
                team: data.event.team,
                description: data.event.description,
                position: data.event.position,
              },
            ],
          }));
        }
      }
    );

    socket.on("analysis_complete", (data: { jobId: string }) => {
      if (data.jobId === jobIdRef.current) {
        setState((s) => ({ ...s, status: "completed", progress: 100 }));
      }
    });

    socket.on("connect_error", (err: Error) => {
      setState((s) => ({
        ...s,
        status: "error",
        error: err.message,
        isConnected: false,
      }));
    });
  }, []);

  const leaveSession = useCallback(() => {
    disconnectSocket();
    setState(initialState);
  }, []);

  // Auto-connect when jobId is set — use setTimeout to avoid synchronous setState in effect
  useEffect(() => {
    if (!jobId) return;
    const timer = setTimeout(() => joinSession(), 0);
    return () => {
      clearTimeout(timer);
      disconnectSocket();
    };
  }, [jobId, joinSession]);

  return {
    ...state,
    joinSession,
    leaveSession,
  };
}
