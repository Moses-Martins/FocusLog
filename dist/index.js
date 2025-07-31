import express from 'express';
const app = express();
const PORT = 8080;
app.get("/healthz", handlerReadiness);
app.use("/app", express.static("./src/app"));
app.use("/app", express.static("./assets/logo.png"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
function handlerReadiness(req, res) {
    res.set('content-Type', 'text/plain');
    res.send("OK");
}
