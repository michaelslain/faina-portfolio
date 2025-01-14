import sharp from 'sharp'
import path from 'path'
import fs from 'fs-extra'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type {
    ImageResolution,
    ProcessedImage,
    StorageConfig,
} from '@/types/image'

const RESOLUTIONS: Record<ImageResolution, number> = {
    low: 320,
    mid: 720,
    high: 1280,
}

export class ImageProcessor {
    private config: StorageConfig
    private s3Client?: S3Client

    constructor(config: StorageConfig) {
        this.config = config
        if (config.mode === 's3' && config.s3) {
            this.s3Client = new S3Client({
                region: config.s3.region,
                credentials: {
                    accessKeyId: config.s3.accessKeyId,
                    secretAccessKey: config.s3.secretAccessKey,
                },
            })
        }
    }

    async processAndStore(
        file: File | { filepath: string; originalFilename: string },
        fileName: string
    ) {
        const resolutions: Record<ImageResolution, ProcessedImage> =
            {} as Record<ImageResolution, ProcessedImage>

        // Convert File to Buffer if needed
        let buffer: Buffer
        if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
        } else {
            buffer = await fs.readFile(file.filepath)
        }

        // Process each resolution
        for (const [resolution, width] of Object.entries(RESOLUTIONS)) {
            const processed = await this.processResolution(
                buffer,
                fileName,
                resolution as ImageResolution,
                width
            )
            resolutions[resolution as ImageResolution] = processed
        }

        return {
            originalName:
                file instanceof File ? file.name : file.originalFilename,
            fileName,
            resolutions,
        }
    }

    private async processResolution(
        input: Buffer,
        fileName: string,
        resolution: ImageResolution,
        targetWidth: number
    ): Promise<ProcessedImage> {
        const image = sharp(input)
        const metadata = await image.metadata()

        // Calculate height maintaining aspect ratio
        const aspectRatio = metadata.width! / metadata.height!
        const targetHeight = Math.round(targetWidth / aspectRatio)

        // Resize image
        const resized = await image
            .resize(targetWidth, targetHeight, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .jpeg({ quality: resolution === 'low' ? 60 : 80 })
            .toBuffer()

        const resizedSize = Buffer.byteLength(resized)

        if (this.config.mode === 'local') {
            await this.saveLocal(resized, fileName, resolution)
        } else if (this.config.mode === 's3' && this.s3Client) {
            await this.saveToS3(resized, fileName, resolution)
        }

        return {
            url: this.getImageUrl(fileName, resolution),
            width: targetWidth,
            height: targetHeight,
            size: resizedSize,
        }
    }

    private async saveLocal(
        buffer: Buffer,
        fileName: string,
        resolution: ImageResolution
    ) {
        const dir = path.join(
            process.cwd(),
            'public',
            this.config.uploadDir,
            resolution
        )
        await fs.ensureDir(dir)
        await fs.writeFile(path.join(dir, fileName), buffer)
    }

    private async saveToS3(
        buffer: Buffer,
        fileName: string,
        resolution: ImageResolution
    ) {
        if (!this.s3Client || !this.config.s3) {
            throw new Error('S3 client not initialized')
        }

        const key = `${this.config.uploadDir}/${resolution}/${fileName}`
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.config.s3.bucket,
                Key: key,
                Body: buffer,
                ContentType: 'image/jpeg',
            })
        )
    }

    private getImageUrl(fileName: string, resolution: ImageResolution): string {
        if (this.config.mode === 'local') {
            return `${this.config.baseUrl}/${this.config.uploadDir}/${resolution}/${fileName}`
        } else {
            return `https://${this.config.s3!.bucket}.s3.${
                this.config.s3!.region
            }.amazonaws.com/${this.config.uploadDir}/${resolution}/${fileName}`
        }
    }
}
