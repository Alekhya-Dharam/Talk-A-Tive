const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const path = require("path");


const {
  notFound,
  errorHandler,
} = require("./middlewares/errorMiddleware.js");


dotenv.config();
connectDB(); // i made a function there then called that function here
// require("./config/db.js") // i did it without creating a function , so we have to require the file path

app.use(express.json());

// instead of doing app.use(router)
// its like app.use("prefix path", router) addition of prefix path and here i used userRoutes name instead of router, because i will be having messageRoutes, chatRoutes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

//Error handling middlewares
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id)
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log(`User join room: ${room}`)
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users is not defined");

    chat.users.forEach((user) => {
      if (user === newMessageRecieved.sender._id) return;
      console.log(`Sending message to user ${user}`);
      socket.to(user).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup",() => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
