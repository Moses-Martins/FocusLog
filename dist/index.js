import express from 'express';
import { Error400, Error401, Error403, Error404 } from './ErrorClass.js';
import { config } from './config.js';
import { handlerCreateSession } from './handlerCreateSession.js';
import { handlerCreateTag } from './handlerCreateTag.js';
import { handlerDailySummary } from './handlerDailySummary.js';
import { handlerDeleteSessionByID } from './handlerDeleteSessionByID.js';
import { handlerDeleteTagByID } from './handlerDeleteTagByID.js';
import { handlerExportCsv } from './handlerExportCsv.js';
import { handlerGetSessionByID } from './handlerGetSessionByID.js';
import { handlerGetSessionByNoteSearch } from './handlerGetSessionByNoteSearch.js';
import { handlerGetSessions } from './handlerGetSessions.js';
import { handlerGetTag } from './handlerGetTag.js';
import { handlerGetTagByID } from './handlerGetTagByID.js';
import { handlerLogin } from './handlerLogin.js';
import { handlerMe } from './handlerMe.js';
import { handlerRegister } from './handlerRegister.js';
import { swaggerSpec, swaggerUiMiddleware } from './swagger.js';
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.use(express.json());
// Mount Swagger docs
app.use('/api-docs', swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));
app.post("/api/auth/register", async (req, res, next) => {
    try {
        await handlerRegister(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.post("/api/auth/login", async (req, res, next) => {
    try {
        await handlerLogin(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.use("/api/auth/me", async (req, res, next) => {
    try {
        await handlerMe(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.post("/api/sessions", async (req, res, next) => {
    try {
        await handlerCreateSession(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.get("/api/sessions", async (req, res, next) => {
    try {
        await handlerGetSessions(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.get("/api/sessions/:id", async (req, res, next) => {
    try {
        await handlerGetSessionByID(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.delete("/api/sessions/:id", async (req, res, next) => {
    try {
        await handlerDeleteSessionByID(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.post("/api/tags", async (req, res, next) => {
    try {
        await handlerCreateTag(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.get("/api/tags", async (req, res, next) => {
    try {
        await handlerGetTag(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.get("/api/tags/:id", async (req, res, next) => {
    try {
        await handlerGetTagByID(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.delete("/api/tags/:id", async (req, res, next) => {
    try {
        await handlerDeleteTagByID(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.get("/api/export/csv", async (req, res, next) => {
    try {
        await handlerExportCsv(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.get("/api/search", async (req, res, next) => {
    try {
        await handlerGetSessionByNoteSearch(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.get("/api/summary/daily", async (req, res, next) => {
    try {
        await handlerDailySummary(req, res);
    }
    catch (error) {
        next(error); // Pass the error to Express
    }
});
app.post("/admin/reset", handlerReset);
app.get("/admin/metrics", handlerMetrics);
app.get("/api/healthz", handlerReadiness);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/app", express.static("./assets/logo.png"));
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
/**
 * @swagger
 * /api/healthz:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns "OK" when the API server is healthy.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
function handlerReadiness(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send("OK");
}
/**
 * @swagger
 * /admin/metrics:
 *   get:
 *     summary: View simple HTML metrics page
 *     description: Displays a basic HTML page with visit metrics for the FocusLog app.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Metrics page displayed successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>Welcome, FocusLog Admin</h1><p>FocusLog has been visited 5 times!</p></body></html>"
 */
function handlerMetrics(req, res) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<html>
                <body>
                    <h1>Welcome, FocusLog Admin</h1>
                    <p>FocusLog has been visited ${config.fileserverHits} times!</p>
                </body>
            </html>`);
}
/**
 * @swagger
 * /admin/reset:
 *   post:
 *     summary: Reset hit metrics
 *     description: Resets the FocusLog file server hit counter back to 0.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Metrics successfully reset
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hits reset to 0
 */
function handlerReset(req, res) {
    res.set('Content-Type', 'text/plain');
    config.fileserverHits = 0;
    res.send("Hits reset to 0");
}
function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        if (res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}
function middlewareMetricsInc(req, res, next) {
    config.fileserverHits++;
    next();
}
function errorHandler(err, req, res, next) {
    console.log(err.message);
    if (err instanceof Error400) {
        res.status(400).json({ error: err.message });
    }
    else if (err instanceof Error401) {
        res.status(401).json({ error: err.message });
    }
    else if (err instanceof Error403) {
        res.status(403).json({ error: err.message });
    }
    else if (err instanceof Error404) {
        res.status(404).json({ error: err.message });
    }
    else {
        res.status(500).json({
            error: "Something went wrong on our end"
        });
    }
}
