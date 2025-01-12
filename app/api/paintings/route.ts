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
        const formData = await request.formData()
        const name = formData.get('name') as string
        const isFramed = formData.get('isFramed') === 'true'
        const size = formData.get('size') as string
        const medium = formData.get('medium') as string
        const price = parseFloat(formData.get('price') as string)
        const categoryId = parseInt(formData.get('categoryId') as string)
        const imageFile = formData.get('image') as File

        if (!imageFile || !name || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Process image with different resolutions
        const imageProcessor = new ImageProcessor(storageConfig)
        const fileName = `${crypto.randomBytes(16).toString('hex')}.jpg`
        const processedImage = await imageProcessor.processAndStore(
            { filepath: imageFile.name, originalFilename: imageFile.name },
            fileName
        )

        // Store the high-resolution image in the database
        const image = Buffer.from(await imageFile.arrayBuffer())

        const painting = await prisma.painting.create({
            data: {
                name,
                isFramed,
                size: size || '',
                medium: medium || 'oil',
                price: price || 0,
                categoryId,
                image,
            },
            include: {
                category: true,
            },
        })

        // Return both the painting data and processed image URLs
        return NextResponse.json({
            ...painting,
            image: Array.from(painting.image),
            processedImages: processedImage.resolutions,
        })
    } catch (error) {
        console.error('Error creating painting:', error)
        return NextResponse.json(
            { error: 'Error creating painting' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData()
        const id = parseInt(formData.get('id') as string)
        const name = formData.get('name') as string
        const isFramed = formData.get('isFramed') === 'true'
        const size = formData.get('size') as string
        const medium = formData.get('medium') as string
        const price = parseFloat(formData.get('price') as string)
        const categoryId = parseInt(formData.get('categoryId') as string)
        const imageFile = formData.get('image') as File | null

        const data: any = {
            name,
            isFramed,
            size,
            medium,
            price,
            categoryId,
        }

        let processedImage = null
        if (imageFile) {
            // Process new image with different resolutions
            const imageProcessor = new ImageProcessor(storageConfig)
            const fileName = `${crypto.randomBytes(16).toString('hex')}.jpg`
            processedImage = await imageProcessor.processAndStore(
                { filepath: imageFile.name, originalFilename: imageFile.name },
                fileName
            )
            data.image = Buffer.from(await imageFile.arrayBuffer())
        }

        const painting = await prisma.painting.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        })

        // Return both the painting data and processed image URLs if there's a new image
        return NextResponse.json({
            ...painting,
            image: Array.from(painting.image),
            ...(processedImage && {
                processedImages: processedImage.resolutions,
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
