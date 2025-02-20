import sharp from 'sharp'
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
    private s3Client: S3Client

    constructor(config: StorageConfig) {
        this.config = config
        const s3Config = {
            region: config.s3.region,
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
            },
        }

        // Add local testing configurations if endpoint is provided
        if (config.s3.endpoint) {
            Object.assign(s3Config, {
                endpoint: config.s3.endpoint,
                forcePathStyle: true,
                credentials: {
                    ...s3Config.credentials,
                },
            })
        }

        this.s3Client = new S3Client(s3Config)
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

        // Upload to S3
        const key = `${this.config.uploadDir}/${resolution}/${fileName}`
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.config.s3.bucket,
                Key: key,
                Body: resized,
                ContentType: 'image/jpeg',
            })
        )

        return {
            url: this.getImageUrl(fileName, resolution),
            width: targetWidth,
            height: targetHeight,
            size: resizedSize,
        }
    }

    private getImageUrl(fileName: string, resolution: ImageResolution): string {
        // Use our API route instead of direct S3 URLs
        return `${this.config.baseUrl}/api/image/${resolution}/${fileName}`
    }
}
