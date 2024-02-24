import express from "express";

import {
    uploadProcessedVideoFolder,
    downloadRawVideo,
    deleteProcessedLocalFolder,
    deleteRawLocalFile,
    convertVideo,
    setupDirectories, 
    transcodeVideo
} from './storage'



const app = express();
app.use(express.json())

// Process a video file from Cloud Storage into multiple resolutions and attach thumbnails
app.post('/process-video', async (req, res) => {


    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name;
    const fileNameWithoutExtension = inputFileName.substring(0, inputFileName.lastIndexOf('.')) || inputFileName;
    const outputFolderName = `${fileNameWithoutExtension}`;

    //Create the local directories
    setupDirectories(fileNameWithoutExtension);

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    // Process the video into 360p
    try {
        // await convertVideo(inputFileName, outputFolderName)
        await transcodeVideo(inputFileName, outputFolderName)
    } catch (err) {
        await Promise.all([
            deleteRawLocalFile(inputFileName),
            deleteProcessedLocalFolder(outputFolderName)
        ]);
        return res.status(500).send('Processing failed');
    }

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideoFolder(outputFolderName);

    await Promise.all([
        deleteRawLocalFile(inputFileName),
        deleteProcessedLocalFolder(outputFolderName)
    ]);

    return res.status(200).send('Processing finished successfully');
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing on port ${port}`)
});