import { Storage, TransferManager } from "@google-cloud/storage";
import { Transcoder } from "simple-hls";
import fs from 'fs';
import Ffmpeg from "fluent-ffmpeg";

const storage = new Storage()

const rawVideoBucketName = "sb-yt-pm-rw-vid";
const processedVideoBucketName = "sb-yt-pm-processed-vid";

const transferManager = new TransferManager(storage.bucket(processedVideoBucketName))

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates local directories for raw and processed videos
 */
export function setupDirectories(outputFolderName: string) {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
    ensureDirectoryExistence(`./processed-videos/${outputFolderName}`)
}


export async function transcodeVideo(rawVideoName: string, processedVideoName: string) {
    const outputPath = `${localProcessedVideoPath}/${processedVideoName}`;
    const t = new Transcoder(`${localRawVideoPath}/${rawVideoName}`, outputPath, { showLogs: false });
    try {
        const hlsPath = await t.transcode();
        console.log('Successfully Transcoded Video');
    } catch (e) {
        console.log('Something went wrong');
    };
    return new Promise<void>((resolve, reject) => {
        const inputFilePath = `${localRawVideoPath}/${rawVideoName}`;
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
}

/**
 * 
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    const resolutions = [
        { suffix: '480p', size: '480' },
        { suffix: '360p', size: '360' }
    ]
    const inputFilePath = `${localRawVideoPath}/${rawVideoName}`;
    return Promise.all(resolutions.map((resolution) => {
        return new Promise<void>((resolve, reject) => {
            const outputFilePath = processedVideoName.replace(/(\.[\w\d_-]+)$/i, `-${resolution.suffix}$1`);
            const outputPath = `${localProcessedVideoPath}/${processedVideoName}/${outputFilePath}.mp4`;
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
            destination: `${localRawVideoPath}/${fileName}`
        });
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}


export async function uploadProcessedVideoFolder(folderName: string) {
    const folderPath = `${localProcessedVideoPath}/${folderName}`

    const bucket = storage.bucket(processedVideoBucketName);

    // Uploads the directory
    await transferManager.uploadManyFiles(folderPath)
        .then(() => {
            console.log(`${folderName} uploaded successfully.`);
        })
        .catch((err) => {
            console.log("Error occured when uploading folder")
        });
}

export async function deleteProcessedLocalFolder(folderPath: string) {
    const actualFolderPath = `${localProcessedVideoPath}/${folderPath}`
    return new Promise<void>((resolve, reject) => {
        if (fs.existsSync(actualFolderPath)) {
            fs.rm(actualFolderPath, { recursive: true, force: true }, (err) => {
                if (err) {
                    console.log("Failed to delete folder");
                    reject(err);
                } else {
                    console.log("Folder deleted successfully");
                    resolve();
                }
            });
        } else {
            console.log("Folder not found, skipping deletion");
            resolve();
        }
    });
}

export async function deleteRawLocalFile(filePath: string): Promise<void> {
    const actualFilePath = `${localRawVideoPath}/${filePath}`
    return new Promise((resolve, reject) => {
        if (fs.existsSync(actualFilePath)) {
            fs.unlink(actualFilePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file at ${actualFilePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${actualFilePath}`);
                    resolve();
                }
            });
        } else {
            console.log(`File not found at ${actualFilePath}, skipping delete.`);
            resolve();
        }
    });
}

/**
 * 
 */
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}