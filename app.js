const express = require("express");
const app = express();
const port = 8080;
const http = require("http");
const path = require('path');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

// Set the view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Route to render the index view
app.get("/", (req, res) => {
    res.render("index");
});

// Socket.io connection
io.on("connection", (socket) => {
    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        io.emit("user-disconnect", socket.id);
    });
});

app.get("/error", (req, res) => {
    // Simulate an error
    res.status(500).send('Simulated error');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
