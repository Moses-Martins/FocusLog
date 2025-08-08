import express, { Request, Response, NextFunction } from 'express';
import { handlerRegister } from './handlerRegister.js'
import { handlerLogin } from './handlerLogin.js'
import { handlerMe } from './handlerMe.js'
import { handlerCreateSession } from './handlerCreateSession.js'
import { handlerGetSessions } from './handlerGetSessions.js'
import { handlerGetSessionByID } from './handlerGetSessionByID.js'
import { handlerDeleteSessionByID } from './handlerDeleteSessionByID.js'
import { handlerCreateTag } from './handlerCreateTag.js'
import { handlerGetTag } from './handlerGetTag.js'
import { handlerGetTagByID } from './handlerGetTagByID.js'
import { handlerDeleteTagByID } from './handlerDeleteTagByID.js'
import { handlerExportCsv } from './handlerExportCsv.js'
import { handlerGetSessionByNoteSearch } from './handlerGetSessionByNoteSearch.js'
import { handlerDailySummary } from './handlerDailySummary.js'
import { Error400, Error401, Error403, Error404 } from './ErrorClass.js';
import { config } from './config.js'


const app = express();
const PORT = 8080;

app.use(middlewareLogResponses)
app.use(express.json())


app.post("/api/auth/register", async (req, res, next) => {
  try {
    await handlerRegister(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.post("/api/auth/login", async (req, res, next) => {
  try {
    await handlerLogin(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.use("/api/auth/me", async (req, res, next) => {
  try {
    await handlerMe(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.post("/api/sessions", async (req, res, next) => {
  try {
    await handlerCreateSession(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.get("/api/sessions", async (req, res, next) => {
  try {
    await handlerGetSessions(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.get("/api/sessions/:id", async (req, res, next) => {
  try {
    await handlerGetSessionByID(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.delete("/api/sessions/:id", async (req, res, next) => {
  try {
    await handlerDeleteSessionByID(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.post("/api/tags", async (req, res, next) => {
  try {
    await handlerCreateTag(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.get("/api/tags", async (req, res, next) => {
  try {
    await handlerGetTag(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.get("/api/tags/:id", async (req, res, next) => {
  try {
    await handlerGetTagByID(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.delete("/api/tags/:id", async (req, res, next) => {
  try {
    await handlerDeleteTagByID(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.get("/api/export/csv", async (req, res, next) => {
  try {
    await handlerExportCsv(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.get("/api/search", async (req, res, next) => {
  try {
    await handlerGetSessionByNoteSearch(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.get("/api/summary/daily", async (req, res, next) => {
  try {
    await handlerDailySummary(req, res);
  } catch (error) {
    next(error); // Pass the error to Express
  }
});
app.post("/admin/reset", handlerReset);
app.get("/admin/metrics", handlerMetrics);
app.get("/api/healthz", handlerReadiness);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/app", express.static("./assets/logo.png"));

app.use(errorHandler)

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
        if (res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
        }
    })
    next()
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++
    next()
}

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err.message);
    if (err instanceof Error400) {
        res.status(400).json({error: err.message});
    } else if (err instanceof Error401) {
        res.status(401).json({error: err.message});
    } else if (err instanceof Error403) {
        res.status(403).json({error: err.message});
    } else if (err instanceof Error404) {
        res.status(404).json({error: err.message});
    } else {
        res.status(500).json({
            error: "Something went wrong on our end"
        })
    }

}