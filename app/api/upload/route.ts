import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import { ImageProcessor } from '@/utils/imageProcessor'
import crypto from 'crypto'
import { StorageConfig } from '@/types/image'

// Disable body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
}

// Initialize storage configuration
const storageConfig: StorageConfig = {
    mode: (process.env.STORAGE_MODE as 'local' | 's3') || 'local',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    uploadDir: 'uploads',
    ...(process.env.STORAGE_MODE === 's3' && {
        s3: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            region: process.env.AWS_REGION!,
            bucket: process.env.AWS_BUCKET_NAME!,
        },
    }),
}

export async function POST(request: NextRequest) {
    try {
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB
            filter: part => {
                return (
                    part.mimetype?.includes('image/jpeg') ||
                    part.mimetype?.includes('image/png') ||
                    false
                )
            },
        })

        // Parse form data
        const [fields, files] = await new Promise<
            [formidable.Fields, formidable.Files]
        >((resolve, reject) => {
            form.parse(request, (err, fields, files) => {
                if (err) reject(err)
                resolve([fields, files])
            })
        })

        const file = files.image?.[0]
        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            )
        }

        // Generate unique filename
        const ext = file.originalFilename?.split('.').pop() || 'jpg'
        const fileName = `${crypto.randomBytes(16).toString('hex')}.${ext}`

        // Process and store image
        const imageProcessor = new ImageProcessor(storageConfig)
        const result = await imageProcessor.processAndStore(file, fileName)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to process image' },
            { status: 500 }
        )
    }
}
