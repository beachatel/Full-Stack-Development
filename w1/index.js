import express from 'express'

const app = express();
const port = 3000;

app.use(express.static("public"))

app.get("/api", async (req,res) => {

    const { latitude, longitude } = req.query;

    const URL =  `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=2026-01-01&end_date=2026-01-01&hourly=temperature_2m`
    const response = await fetch(URL);
    const body = await response.json();

    console.log(body)
    res.send(body);
});
app.listen(port, () => {
    console.log('`Example app listening on port ${port}`');
});