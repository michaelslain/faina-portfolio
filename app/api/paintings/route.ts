import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ImageProcessor } from '@/utils/imageProcessor'
import crypto from 'crypto'
import { StorageConfig } from '@/types/image'

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

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const categoryId = searchParams.get('categoryId')

        const paintings = await prisma.painting.findMany({
            where: categoryId
                ? { categoryId: parseInt(categoryId) }
                : undefined,
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Convert image Buffer to Array for proper JSON serialization
        const serializedPaintings = paintings.map(painting => ({
            ...painting,
            image: Array.from(painting.image),
        }))

        return NextResponse.json(serializedPaintings)
    } catch (error) {
        console.error('Error fetching paintings:', error)
        return NextResponse.json(
            { error: 'Error fetching paintings' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { name, isFramed, size, medium, price, categoryId, imageUpload } =
            data

        console.log('Received data:', {
            name,
            isFramed,
            size,
            medium,
            price,
            categoryId,
            hasImageUpload: !!imageUpload,
            imageUploadStructure: imageUpload
                ? {
                      hasResolutions: !!imageUpload.resolutions,
                      hasHigh: !!imageUpload.resolutions?.high,
                      hasUrl: !!imageUpload.resolutions?.high?.url,
                  }
                : null,
        })

        if (!name || !categoryId) {
            console.log('Missing required fields:', { name, categoryId })
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (!imageUpload?.resolutions?.high?.url) {
            console.log('Missing image data:', { imageUpload })
            return NextResponse.json(
                { error: 'Image is required' },
                { status: 400 }
            )
        }

        let imageBuffer: Buffer
        const imageUrl = imageUpload.resolutions.high.url

        // Handle both base64 data URLs and regular URLs
        if (imageUrl.startsWith('data:')) {
            // It's a base64 data URL
            const base64Data = imageUrl.split(',')[1]
            if (!base64Data) {
                console.log('Invalid base64 data URL')
                return NextResponse.json(
                    { error: 'Invalid image data' },
                    { status: 400 }
                )
            }
            imageBuffer = Buffer.from(base64Data, 'base64')
        } else {
            // It's a regular URL, fetch the image
            try {
                const response = await fetch(imageUrl)
                const arrayBuffer = await response.arrayBuffer()
                imageBuffer = Buffer.from(arrayBuffer)
            } catch (error) {
                console.log('Failed to fetch image from URL:', error)
                return NextResponse.json(
                    { error: 'Failed to process image' },
                    { status: 400 }
                )
            }
        }

        const createData = {
            name,
            isFramed,
            size: size || '',
            medium: medium || 'oil',
            price: price || 0,
            categoryId,
            image: imageBuffer,
        }

        const painting = await prisma.painting.create({
            data: createData,
            include: {
                category: true,
            },
        })

        // Return both the painting data and processed image URLs
        return NextResponse.json({
            ...painting,
            image: painting.image ? Array.from(painting.image) : null,
            ...(imageUpload && {
                processedImages: imageUpload.resolutions,
            }),
        })
    } catch (error) {
        console.error(
            'Error creating painting:',
            error instanceof Error ? error.message : 'Unknown error'
        )
        return NextResponse.json(
            { error: 'Failed to create painting. Please try again.' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json()
        const {
            id,
            name,
            isFramed,
            size,
            medium,
            price,
            categoryId,
            imageUpload,
        } = data

        const updateData: any = {
            name,
            isFramed,
            size,
            medium,
            price,
            categoryId,
        }

        if (imageUpload) {
            // Store the high-resolution image in the database
            updateData.image = Buffer.from(
                imageUpload.resolutions.high.url.split(',')[1],
                'base64'
            )
        }

        const painting = await prisma.painting.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
            },
        })

        // Return both the painting data and processed image URLs if there's a new image
        return NextResponse.json({
            ...painting,
            image: Array.from(painting.image),
            ...(imageUpload && {
                processedImages: imageUpload.resolutions,
            }),
        })
    } catch (error) {
        console.error('Error updating painting:', error)
        return NextResponse.json(
            { error: 'Error updating painting' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json()
        await prisma.painting.delete({
            where: { id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting painting:', error)
        return NextResponse.json(
            { error: 'Error deleting painting' },
            { status: 500 }
        )
    }
}
