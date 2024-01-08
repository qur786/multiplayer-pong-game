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

// Map to associate sockets with room IDs
const socketToRoomMap = new Map();

// Set the view engine and views directory for EJS templates
app.set("view engine", "ejs");
app.set("views", join(__dirname, "public"));

// Serve static files from the 'public' directory
app.use("/", express.static(join(__dirname, "public")));

// Render the index.ejs file when accessing the root URL
app.get("/", (_req, res) => {
  res.render("index.ejs");
});

let playerCount = 0;

// Event listener for new socket connections
io.on("connection", (socket) => {
  // Event handler for when a player wants to play
  socket.on("play", async (playerID) => {
    // Generate a new room ID based on player count
    const roomID = getLatestRoomID(playerCount);

    // Join the socket to the generated room
    socket.join(roomID);

    // Map the player's socket ID to the generated room ID
    socketToRoomMap.set(playerID, roomID);

    // Check if the room has two players; if yes, emit 'start' event to begin the game
    if ((await io.in(roomID).fetchSockets()).length === 2) {
      io.to(roomID).emit("start", playerID);
    }
    playerCount += 1;
  });

  // Event handler for when a game is over
  socket.on("game-over", (playerID) => {
    const roomID = socketToRoomMap.get(playerID);

    // Remove all players associated with the same room ID from the map
    for (let [key, value] of socketToRoomMap) {
      if (value === roomID) {
        socketToRoomMap.delete(key);
      }
    }

    // Make all sockets leave the room
    io.socketsLeave(roomID);
  });

  // Event handler for when a player's paddle moves
  socket.on("paddle-move", (value) => {
    // Broadcast the paddle movement to the other player in the same room
    socket.to(socketToRoomMap.get(socket.id)).emit("paddle-move", value);
  });

  // Event handler for when the ball moves
  socket.on("ball-move", (value) => {
    // Broadcast the ball movement to the other player in the same room
    socket.to(socketToRoomMap.get(socket.id)).emit("ball-move", value);
  });
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
