import express, { Request, Response, NextFunction } from 'express';
import { config } from './config.js'
import path from "path"

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses)

app.get("/admin/reset", handlerReset);
app.get("/admin/metrics", handlerMetrics);
app.get("/api/healthz", handlerReadiness);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/app", express.static("./assets/logo.png"));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})

function handlerReadiness(req: Request, res: Response) {
    res.set('Content-Type', 'text/plain')
    res.send("OK")
}

function handlerMetrics(req: Request, res: Response) {
    res.set('Content-Type', 'text/html; charset=utf-8')
    res.send(`<html>
                <body>
                    <h1>Welcome, FocusLog Admin</h1>
                    <p>FocusLog has been visited ${config.fileserverHits} times!</p>
                </body>
            </html>`)
}

function handlerReset(req: Request, res: Response) {
    res.set('Content-Type', 'text/plain')
    config.fileserverHits = 0
    res.send("Hits reset to 0")
}


function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
        }
    })
    next()
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++
    next()
}