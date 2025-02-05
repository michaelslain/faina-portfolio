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

export interface S3Config {
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucket: string
    endpoint?: string // For local testing
    forcePathStyle?: boolean // For local testing
}

export interface StorageConfig {
    baseUrl: string
    uploadDir: string
    s3: S3Config
}
