import { NextRequest, NextResponse } from 'next/server'
import { ImageProcessor } from '@/utils/imageProcessor'
import crypto from 'crypto'
import { StorageConfig } from '@/types/image'

// Initialize storage configuration
const storageConfig: StorageConfig = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    uploadDir: 'uploads',
    s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!,
        bucket: process.env.AWS_BUCKET_NAME!,
        // Add local testing configurations if endpoint is provided
        ...(process.env.AWS_ENDPOINT && {
            endpoint: process.env.AWS_ENDPOINT,
            forcePathStyle: true,
        }),
    },
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('image') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (
            !file.type.includes('image/jpeg') &&
            !file.type.includes('image/png')
        ) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG and PNG are allowed.' },
                { status: 400 }
            )
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            )
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg'
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
