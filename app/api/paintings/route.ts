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

        // Convert imageUrls JSON to processedImages format
        const serializedPaintings = paintings.map(painting => ({
            ...painting,
            processedImages: painting.imageUrls,
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

        if (!name || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (!imageUpload?.resolutions?.high?.url) {
            return NextResponse.json(
                { error: 'Image is required' },
                { status: 400 }
            )
        }

        // Format imageUrls as a proper JSON object
        const imageUrls = {
            low: { url: imageUpload.resolutions.low.url },
            mid: { url: imageUpload.resolutions.mid.url },
            high: { url: imageUpload.resolutions.high.url },
        }

        const createData = {
            name,
            isFramed,
            size: size || '',
            medium: medium || 'oil',
            price: parseFloat(price) || 0,
            categoryId: parseInt(categoryId),
            imageUrls,
        }

        console.log('Creating painting with data:', createData)

        const painting = await prisma.painting.create({
            data: createData,
            include: {
                category: true,
            },
        })

        return NextResponse.json({
            ...painting,
            processedImages: painting.imageUrls,
        })
    } catch (error) {
        console.error('Error creating painting:', error)
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
            price: parseFloat(price) || 0,
            categoryId: parseInt(categoryId),
        }

        if (imageUpload) {
            updateData.imageUrls = {
                low: { url: imageUpload.resolutions.low.url },
                mid: { url: imageUpload.resolutions.mid.url },
                high: { url: imageUpload.resolutions.high.url },
            }
        }

        const painting = await prisma.painting.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
            },
        })

        return NextResponse.json({
            ...painting,
            processedImages: painting.imageUrls,
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
