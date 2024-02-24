import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import Ffmpeg from "fluent-ffmpeg";

const storage = new Storage()

const rawVideoBucketName = "sb-google-pm-rw-vid";
const processedVideoBucketName = "sb-google-pm-processed-vid";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates local directories for raw and processed videos
 */
export function setupDirectories() {

}

/**
 * 
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    const resolutions = [
        { suffix: '720p', size: '720' },
        { suffix: '480p', size: '480' },
        { suffix: '360p', size: '360' }
    ]
    const inputFilePath = `${localRawVideoPath}/${rawVideoName}`;
    return Promise.all(resolutions.map((resolution) => {
        return new Promise<void>((resolve, reject) => {
            const outputFilePath = rawVideoName.replace(/(\.[\w\d_-]+)$/i, `-${resolution.suffix}$1`);
            const outputPath = `${localProcessedVideoPath}/${processedVideoName}/${outputFilePath}`;
            Ffmpeg(inputFilePath)
                .outputOptions("-vf", `scale=-1:${resolution.size}`)
                .on("end", () => resolve())
                .on("error", (err) => reject(err.message))
                .save(outputPath);
        });
    })).then(() => {
        return new Promise<void>((resolve, reject) => {
            Ffmpeg(inputFilePath)
                .screenshots({
                    count: 5,
                    folder: `${localProcessedVideoPath}/${processedVideoName}/thumbnails`,
                    filename: 'thumbnail-at-%s-seconds.png'
                })
                .on('end', () => {
                    console.log("Video finished processing and screenshots taken successfully!");
                    resolve();
                })
                .on('error', (err) => {
                    console.log(`Error taking screenshots: ${err.message}`);
                    reject(err);
                });
        });
    }).catch((error) => {
        console.error("An error occurred:", error);
        throw new Error(error); // Propagate the error
    });
}


/**
 * Download raw video 
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({
            destination: `${localRawVideoPath}/${fileName}/`
        });
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}


