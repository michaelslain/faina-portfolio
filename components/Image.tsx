'use client'

import { FC, useState, useEffect } from 'react'
import NextImage from 'next/image'
import styles from './Image.module.scss'
import classes from '@/utils/classes'

interface ImageProps {
    image: {
        low: { url: string }
        mid: { url: string }
        high: { url: string }
    }
    alt: string
    className?: string
    priority?: boolean
}

// Transform S3 URL to our API route URL
const transformUrl = (url: string) => {
    try {
        // Extract the resolution and filename from S3 URL
        const match = url.match(/\/uploads\/(low|mid|high)\/([^/]+)$/)
        if (!match) return url

        const [, resolution, filename] = match
        return `/api/image/${resolution}/${filename}`
    } catch (error) {
        console.error('Error transforming URL:', error)
        return url
    }
}

const Image: FC<ImageProps> = ({ image, alt, className, priority = false }) => {
    const [currentQuality, setCurrentQuality] = useState<
        'low' | 'mid' | 'high'
    >(priority ? 'high' : 'low')

    // Transform URLs to use our API route
    const transformedImage = {
        low: { url: transformUrl(image.low.url) },
        mid: { url: transformUrl(image.mid.url) },
        high: { url: transformUrl(image.high.url) },
    }

    useEffect(() => {
        console.log('Image URLs:', {
            low: transformedImage.low.url,
            mid: transformedImage.mid.url,
            high: transformedImage.high.url,
            current: transformedImage[currentQuality].url,
        })
    }, [])

    useEffect(() => {
        if (priority) return

        console.log('Loading mid quality:', transformedImage.mid.url)
        // Preload mid quality
        const midImg = new window.Image()
        midImg.src = transformedImage.mid.url
        midImg.onload = () => {
            console.log('Mid quality loaded')
            // Only upgrade if we're still on low quality
            if (currentQuality === 'low') {
                setCurrentQuality('mid')
            }

            console.log('Loading high quality:', transformedImage.high.url)
            // Preload high quality
            const highImg = new window.Image()
            highImg.src = transformedImage.high.url
            highImg.onload = () => {
                console.log('High quality loaded')
                // Only upgrade if we're still on mid quality
                if (currentQuality === 'mid') {
                    setCurrentQuality('high')
                }
            }
        }
    }, [transformedImage, priority, currentQuality])

    useEffect(() => {
        console.log(
            'Quality changed to:',
            currentQuality,
            transformedImage[currentQuality].url
        )
    }, [currentQuality])

    return (
        <div className={classes(styles.wrapper, className)}>
            <NextImage
                src={transformedImage[currentQuality].url}
                alt={alt}
                className={styles.image}
                width={1000}
                height={1000}
                quality={100}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={e => {
                    console.error(
                        'Image failed to load:',
                        transformedImage[currentQuality].url
                    )
                }}
            />
        </div>
    )
}

export default Image
