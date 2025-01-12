import { NextConfig } from 'next'

const config: NextConfig = {
    images: {
        domains: [
            'localhost',
            process.env.AWS_BUCKET_NAME
                ? `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
                : '',
        ].filter(Boolean),
        unoptimized: process.env.STORAGE_MODE === 'local',
    },
}

export default config
