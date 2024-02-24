import express from "express";
import Ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json())

app.post("/process-video", (req, res) => {
    const inputFilePath = req.body.inputFilePath;

    if (!inputFilePath) {
        res.status(400).send("Bad Request: Missing file path.")
    }

    



})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing on port ${port}`)
});