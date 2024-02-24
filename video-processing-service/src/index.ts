import express from "express";
import Ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json())

app.post("/process-video", (req, res) => {
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.")
    }

    Ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=-1:360")
        .on("end", () => {
            res.status(200).send("Video processing finished successfully")
        })
        .on("error", (err) => {
            console.log(`Error message: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`)
        })
        .save(outputFilePath)
        .ffprobe((err, data)=> {
            console.log('video metadata:');
            console.dir(data);
        })
        
    
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing on port ${port}`)
});