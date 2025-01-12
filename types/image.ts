export type ImageResolution = 'low' | 'mid' | 'high'

export interface ProcessedImage {
    url: string
    width: number
    height: number
    size: number
}

export interface ImageUploadResult {
    originalName: string
    fileName: string
    resolutions: Record<ImageResolution, ProcessedImage>
}

export interface StorageConfig {
    mode: 'local' | 's3'
    baseUrl: string
    uploadDir: string
    s3?: {
        accessKeyId: string
        secretAccessKey: string
        region: string
        bucket: string
    }
}
