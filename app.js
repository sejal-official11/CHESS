const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();

let players = {};
let currentPlayer = "w";
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Custom Chess Game" });
});

io.on("connection", function (uniquesocket) {
  console.log("Connected");

  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("spectatorRole");
  }

  uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });


  uniquesocket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && uniquesocketsocket.id !== players.white) return;
      if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

      const result = chess.move(move); // if valid move
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move); // shows on FE to everyone
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move: ", move);
        uniquesocket.emit("invalid move: ", move); // only player has to know for invalid move
      }
    } catch (err) {
      // if engine ets fail due to move then it comes to catch() block
      console.log(err);
      uniquesocket.emit("Invalid move: ".move);
    }
  });
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});
