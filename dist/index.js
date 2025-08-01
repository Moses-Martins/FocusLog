import express from 'express';
import { config } from './config.js';
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.get("/api/reset", handlerReset);
app.get("/admin/metrics", handlerMetrics);
app.get("/api/healthz", handlerReadiness);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/app", express.static("./assets/logo.png"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
function handlerReadiness(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send("OK");
}
function handlerMetrics(req, res) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<html>
                <body>
                    <h1>Welcome, FocusLog Admin</h1>
                    <p>FocusLog has been visited ${config.fileserverHits} times!</p>
                </body>
            </html>`);
}
function handlerReset(req, res) {
    res.set('Content-Type', 'text/plain');
    config.fileserverHits = 0;
    res.send("Hits reset to 0");
}
function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        if (res.statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}
function middlewareMetricsInc(req, res, next) {
    config.fileserverHits++;
    next();
}
