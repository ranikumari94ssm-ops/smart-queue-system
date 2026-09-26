const express = require("express");
const cors = require("cors");
const pool = require("./db");
const queueRoutes = require("./routes/queues");
const counterRoutes = require("./routes/counters");
const serviceRoutes = require("./routes/services");
const authRoutes = require("./routes/auth");
const staffRoutes = require("./routes/staff");
const analyticsRoutes = require("./routes/analytics");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Smart Queue System Backend is running!"
    });
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database connected successfully!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/queues", queueRoutes);
app.use("/api/counters", counterRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: "An unexpected server error occurred" });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
