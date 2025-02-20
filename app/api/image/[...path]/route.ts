import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(process.env.AWS_ENDPOINT && {
        endpoint: process.env.AWS_ENDPOINT,
        forcePathStyle: true,
    }),
})

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // Reconstruct the path from the URL segments
        const path = params.path.join('/')

        // Get the object from S3
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `uploads/${path}`,
        })

        const response = await s3Client.send(command)

        if (!response.Body) {
            return new NextResponse('Image not found', { status: 404 })
        }

        // Convert the readable stream to a buffer
        const chunks = []
        for await (const chunk of response.Body as any) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)

        // Return the image with appropriate headers
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.ContentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Error fetching image:', error)
        return new NextResponse('Error fetching image', { status: 500 })
    }
}
