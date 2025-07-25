const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const http = require('http');
const socketIo = require('socket.io');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);

const socket = require('./socket');
const io = socket.init(server);

const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: false })); // for application/x-www-form-urlencoded
app.use(cookieParser());
app.use(morgan("dev"));

const TARGET_URL = "https://dramaspots.com/"; //
// === STATIC FILES ===

// === ROUTES ===
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const compression = require('compression');
app.use(compression());

const pageRoutes = require('./routes/pageGenerator');

//app.use(express.static(path.join(__dirname, 'testing')));


app.use('/generate', pageRoutes);

// Fallback to home.html
app.get('/homen', (req, res) => {
  res.sendFile(path.join(__dirname, 'testing', 'home.html'));
});
const aiRoutes = require('./routes/ai');
app.use('/ai', aiRoutes);

const categoryRoutes = require('./routes/category');
const serviceRoutes = require('./routes/service');
const gigRoutes = require('./routes/gig');
const paymentRoutes = require('./routes/payment');
const pagesRoutes = require('./routes/pages');

app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/gig', gigRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/', pagesRoutes);
app.use("/tasks", require("./routes/task"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/course", require("./routes/course"));

// Article CRUD
app.use('/auth', userRoutes);           // Categories
app.use('/api', uploadRoutes); 
app.use("/chats", require("./routes/chats"));
app.use("/hustler", require("./routes/hustler"));
app.use("/client", require("./routes/client"));
app.use('/newsletter', require('./routes/newsletter'));

// === AUTO-PING EVERY 13 MINUTES === ✅
if (TARGET_URL) {
    setInterval(() => {
        fetch(`${TARGET_URL}`)
            .then(res => res.text())
            .then(body => console.log(`✅ Pinged ${TARGET_URL} — ${body}`))
            .catch(err => console.error(`❌ Failed to ping ${TARGET_URL}: ${err.message}`));
    }, 780000); // 13 minutes in milliseconds
}

// === 404 HANDLER ===
app.use((req, res, next) => {
  const filePath = path.join(__dirname, '.', 'public', '404.html');
  res.sendFile(filePath);
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server Error' });
});

// === START SERVER ===
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
