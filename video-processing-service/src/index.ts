import express from "express";
import Ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json())

app.post("/process-video", (req, res) => {
    const inputFilePath = req.body.inputFilePath;

    if (!inputFilePath) {
        res.status(400).send("Bad Request: Missing file path.")
    }

    const resolutions = [
        { suffix: '720p', size: '720' },
        { suffix: '480p', size: '480' },
        { suffix: '360p', size: '360' }
    ]

    let completed = 0;

    resolutions.forEach((resolution) => {
        const outputFilePath = inputFilePath.replace(/(\.[\w\d_-]+)$/i, `-${resolution.suffix}$1`);
        Ffmpeg(inputFilePath)
            .outputOptions("-vf", `scale=-1:${resolution.size}`)
            .on("end", () => {
                completed++;

                if (completed == resolutions.length) {
                    Ffmpeg(inputFilePath)
                        .screenshots({
                            count: 5,
                            folder: './screenshots/',
                            filename: 'thumbnail-at-%s-seconds.png'
                        })
                        .on('end', () => {
                            res.status(200).send("Video processing finished successfully")
                        })
                        .on('error', (err) => {
                            console.log(`Error message: ${err.message}`);
                            res.status(500).send(`Internal Server Error: ${err.message}`)
                        })
                }
            })
            .on("error", (err) => {
                completed++;
                if (completed == resolutions.length) {
                    console.log(`Error message: ${err.message}`);
                    res.status(500).send(`Internal Server Error: ${err.message}`)
                }
            })
            .save(outputFilePath)
            .ffprobe((err, data) => {
                console.log('video metadata:');
                console.dir(data);
            })
    })



})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing on port ${port}`)
});