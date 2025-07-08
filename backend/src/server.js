import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// middleware - functions that execute after the request and before the response
if (process.env.NODE_ENV !== "production") { // Only use CORS if not in prodoction (In production we are under one domain so it has no use.)
    app.use(cors({                        // CORS - to allow the frontend to fetch data from backend APIs
        origin: "http://localhost:5173", // frontend origin
    }));
}


app.use(express.json()); // this middleware will parse JSON bodies: req.body

app.use(rateLimiter); // rate limiter - 100 requests in 1 minute


// our simple custom middlewear
// app.use((req, res, next) => {
//     console.log(`Request method is ${req.method} and request URL is ${req.url}`);
//     next();
// });

// API routes
app.use("/api/notes", notesRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist"))); // serve the frontend as a static asset

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html")); // for any requests that are not "/api/notes" respond with the frontend
    })
}

// connect to the DB and then start the app
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on PORT: ${PORT}`);
    });
});


