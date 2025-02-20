import { NextConfig } from 'next'

const config: NextConfig = {
    images: {
        domains: ['localhost'].filter(Boolean),
        unoptimized: true, // Required for S3 images
    },
    // Suppress hydration warnings
    reactStrictMode: false,
    onDemandEntries: {
        // period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 2,
    },
}

export default config
