import { NextConfig } from 'next'

const config: NextConfig = {
    images: {
        domains: [
            'localhost',
            process.env.AWS_ENDPOINT
                ? 'localhost'
                : `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
        ].filter(Boolean),
        unoptimized: true, // Required for S3 images
    },
}

export default config
