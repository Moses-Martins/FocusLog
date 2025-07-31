import express from 'express';
import { config } from './config.js';
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.get("/reset", handlerReset);
app.get("/metrics", handlerNumRequests);
app.get("/healthz", handlerReadiness);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/app", express.static("./assets/logo.png"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
function handlerReadiness(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send("OK");
}
function handlerNumRequests(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(`Hits: ${config.fileserverHits}`);
}
function handlerReset(req, res) {
    res.set('Content-Type', 'text/plain');
    config.fileserverHits = 0;
    res.send(`Reset!!}`);
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
    res.on("finish", () => {
        config.fileserverHits++;
    });
    next();
}
