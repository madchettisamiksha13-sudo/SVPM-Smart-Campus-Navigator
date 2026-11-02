require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Campus Navigator V3 backend is running!",
        aiConfigured: Boolean(process.env.AI_API_KEY)
    });
});

app.listen(PORT, () => {
    console.log(
        `Campus Navigator V3 running at http://localhost:${PORT}`
    );
});