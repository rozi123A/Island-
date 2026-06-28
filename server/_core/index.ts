import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// ── Signaling types ──────────────────────────────────────────────────────────
interface PeerInfo {
  ws: WebSocket;
  userId: string;
  name: string;
  avatar: string;
  partnerId: string | null;
}

const peers = new Map<string, PeerInfo>();
const waitingQueue: string[] = [];

function send(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function matchPeers() {
  while (waitingQueue.length >= 2) {
    const id1 = waitingQueue.shift()!;
    const id2 = waitingQueue.shift()!;
    const p1 = peers.get(id1);
    const p2 = peers.get(id2);
    if (!p1 || !p2) continue;

    p1.partnerId = id2;
    p2.partnerId = id1;

    send(p1.ws, { type: "matched", role: "caller", peer: { name: p2.name, avatar: p2.avatar } });
    send(p2.ws, { type: "matched", role: "callee", peer: { name: p1.name, avatar: p1.avatar } });
  }
}

function removePeer(peerId: string) {
  const peer = peers.get(peerId);
  if (!peer) return;

  // Notify partner
  if (peer.partnerId) {
    const partner = peers.get(peer.partnerId);
    if (partner) {
      partner.partnerId = null;
      send(partner.ws, { type: "peer-left" });
    }
  }

  // Remove from waiting queue
  const qi = waitingQueue.indexOf(peerId);
  if (qi !== -1) waitingQueue.splice(qi, 1);

  peers.delete(peerId);
}

// ── Port helpers ─────────────────────────────────────────────────────────────
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  // ── WebSocket signaling server ──
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let myId: string | null = null;

    ws.on("message", (raw) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      switch (msg.type) {
        case "join": {
          myId = msg.userId || `u_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          peers.set(myId, { ws, userId: myId, name: msg.name || "مستخدم", avatar: msg.avatar || "", partnerId: null });
          waitingQueue.push(myId);
          send(ws, { type: "waiting" });
          matchPeers();
          break;
        }
        case "offer":
        case "answer":
        case "ice-candidate": {
          if (!myId) return;
          const peer = peers.get(myId);
          if (!peer?.partnerId) return;
          const partner = peers.get(peer.partnerId);
          if (partner) send(partner.ws, { type: msg.type, data: msg.data });
          break;
        }
        case "text-message": {
          if (!myId) return;
          const peer = peers.get(myId);
          if (!peer?.partnerId) return;
          const partner = peers.get(peer.partnerId);
          if (partner) send(partner.ws, { type: "text-message", text: msg.text, senderName: peer.name });
          break;
        }
        case "next": {
          if (!myId) return;
          const peer = peers.get(myId);
          if (peer?.partnerId) {
            const partner = peers.get(peer.partnerId);
            if (partner) {
              partner.partnerId = null;
              send(partner.ws, { type: "peer-left" });
              // Put partner back in queue
              waitingQueue.push(peer.partnerId);
              send(partner.ws, { type: "waiting" });
            }
            peer.partnerId = null;
          }
          // Put self back in queue
          const qi = waitingQueue.indexOf(myId);
          if (qi === -1) waitingQueue.push(myId);
          send(ws, { type: "waiting" });
          matchPeers();
          break;
        }
      }
    });

    ws.on("close", () => { if (myId) removePeer(myId); });
    ws.on("error", () => { if (myId) removePeer(myId); });
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} busy, using ${port}`);

  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
