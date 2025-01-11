import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

        // Convert image Buffer to Array for proper JSON serialization
        const serializedPainting = {
            ...painting,
            image: Array.from(painting.image),
        }

        return NextResponse.json(serializedPainting)
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

        if (imageFile) {
            data.image = Buffer.from(await imageFile.arrayBuffer())
        }

        const painting = await prisma.painting.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        })

        // Convert image Buffer to Array for proper JSON serialization
        const serializedPainting = {
            ...painting,
            image: Array.from(painting.image),
        }

        return NextResponse.json(serializedPainting)
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
