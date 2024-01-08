import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { getLatestRoomID } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

const socketToRoomMap = new Map();

app.use("/", express.static(join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

let playerCount = 0;

io.on("connection", (socket) => {
  socket.on("play", async (playerID) => {
    const roomID = getLatestRoomID(playerCount);
    socket.join(roomID);
    socketToRoomMap.set(playerID, roomID);
    if ((await io.in(roomID).fetchSockets()).length === 2) {
      io.to(roomID).emit("start", playerID);
    }
    playerCount += 1;
  });

  socket.on("game-over", (playerID) => {
    const roomID = socketToRoomMap.get(playerID);
    for (let [key, value] of socketToRoomMap) {
      if (value === roomID) {
        socketToRoomMap.delete(key);
      }
    }
    io.socketsLeave(roomID);
  });

  socket.on("paddle-move", (value) => {
    socket.to(socketToRoomMap.get(socket.id)).emit("paddle-move", value);
  });

  socket.on("ball-move", (value) => {
    socket.to(socketToRoomMap.get(socket.id)).emit("ball-move", value);
  });
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
