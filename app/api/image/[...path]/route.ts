import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { LRUCache } from 'lru-cache'

// Create a cache with a max of 100 items that expire after 1 hour
const imageCache = new LRUCache<string, Buffer>({
    max: 100, // Maximum number of items to store
    ttl: 1000 * 60 * 60, // 1 hour TTL
})

// Validate S3 configuration
const s3Config = {
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(process.env.AWS_ENDPOINT && {
        endpoint: process.env.AWS_ENDPOINT,
        forcePathStyle: true,
    }),
}

console.log('S3 Configuration:', {
    region: s3Config.region,
    endpoint: process.env.AWS_ENDPOINT || 'default S3 endpoint',
    bucket: process.env.AWS_BUCKET_NAME,
    hasAccessKey: !!s3Config.credentials.accessKeyId,
    hasSecretKey: !!s3Config.credentials.secretAccessKey,
})

const s3Client = new S3Client(s3Config)

// Test S3 connection on startup
async function validateS3Connection() {
    try {
        await s3Client.send(new HeadBucketCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
        }))
        console.log('Successfully connected to S3 bucket')
    } catch (error) {
        console.error('Failed to connect to S3 bucket:', error)
    }
}
validateS3Connection()

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`[${requestId}] New image request:`, {
        url: request.url,
        path: params.path,
    })

    try {
        // Reconstruct the path from the URL segments
        const path = params.path.join('/')
        console.log(`[${requestId}] Processing path:`, path)

        // Check cache first
        const cachedImage = imageCache.get(path)
        if (cachedImage) {
            console.log(`[${requestId}] Cache hit for:`, path)
            return new NextResponse(cachedImage, {
                headers: {
                    'Content-Type': 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'X-Cache': 'HIT',
                    'X-Request-ID': requestId,
                },
            })
        }

        console.log(`[${requestId}] Cache miss for:`, path)

        // Get the object from S3
        const s3Key = `uploads/${path}`
        console.log(`[${requestId}] Fetching from S3:`, {
            bucket: process.env.AWS_BUCKET_NAME,
            key: s3Key,
            fullPath: `${process.env.AWS_ENDPOINT || 's3://'}${process.env.AWS_BUCKET_NAME}/${s3Key}`,
        })

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: s3Key,
        })

        const response = await s3Client.send(command)
            .catch(error => {
                console.error(`[${requestId}] S3 fetch error:`, {
                    error: error.message,
                    code: error.code,
                    name: error.name,
                    stack: error.stack,
                })
                throw error
            })

        if (!response.Body) {
            console.error(`[${requestId}] No body in S3 response for:`, s3Key)
            return new NextResponse('Image not found', { 
                status: 404,
                headers: { 'X-Request-ID': requestId }
            })
        }

        // Convert the readable stream to a buffer
        const chunks = []
        for await (const chunk of response.Body as any) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)
        
        console.log(`[${requestId}] Successfully fetched image:`, {
            size: buffer.length,
            contentType: response.ContentType,
            metadata: response.Metadata,
        })

        // Store in cache
        imageCache.set(path, buffer)

        // Return the image with appropriate headers
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.ContentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Cache': 'MISS',
                'X-Request-ID': requestId,
            },
        })
    } catch (error: any) {
        console.error(`[${requestId}] Error processing request:`, {
            error: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack,
        })

        return new NextResponse(
            JSON.stringify({
                error: 'Failed to fetch image',
                details: error.message,
                requestId,
            }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId,
                }
            }
        )
    }
}
