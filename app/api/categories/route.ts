import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        })
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Error fetching categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json()
        const category = await prisma.category.create({
            data: { name },
        })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json(
            { error: 'Error creating category' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, name } = await request.json()
        const category = await prisma.category.update({
            where: { id },
            data: { name },
        })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json(
            { error: 'Error updating category' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json()
        await prisma.category.delete({
            where: { id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json(
            { error: 'Error deleting category' },
            { status: 500 }
        )
    }
}
