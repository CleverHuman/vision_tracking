import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${WS_URL}/live`, {
      autoConnect: false,
      auth: {
        token: getAccessToken(),
      },
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  // Update auth token before connecting
  s.auth = { token: getAccessToken() };
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
