'use client'

import { FC, useState, useEffect } from 'react'
import NextImage from 'next/image'
import type { ProcessedImage } from '@/types/image'
import { createImageUrl } from '@/utils/image'
import styles from './Image.module.scss'
import classes from '@/utils/classes'

interface ImageProps {
    image:
        | number[]
        | {
              low: ProcessedImage
              mid: ProcessedImage
              high: ProcessedImage
          }
    alt: string
    className?: string
    priority?: boolean
}

const Image: FC<ImageProps> = ({ image, alt, className, priority = false }) => {
    const [currentQuality, setCurrentQuality] = useState<
        'low' | 'mid' | 'high'
    >(priority ? 'high' : 'low')

    // Get URLs for all quality levels
    const getUrl = (quality: 'low' | 'mid' | 'high') =>
        Array.isArray(image)
            ? createImageUrl(image, quality)
            : image[quality].url

    useEffect(() => {
        if (priority) return

        // Start loading mid resolution
        const midImage = new Image()
        midImage.src = getUrl('mid')
        midImage.onload = () => {
            setCurrentQuality('mid')

            // Then start loading high resolution
            const highImage = new Image()
            highImage.src = getUrl('high')
            highImage.onload = () => {
                setCurrentQuality('high')
            }
        }
    }, [priority])

    return (
        <div className={classes(styles.wrapper, className)}>
            <NextImage
                src={getUrl(currentQuality)}
                alt={alt}
                className={styles.image}
                width={1000}
                height={1000}
                quality={100}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={() => {
                    // On error, try to fall back to a lower quality
                    if (currentQuality === 'high') {
                        setCurrentQuality('mid')
                    } else if (currentQuality === 'mid') {
                        setCurrentQuality('low')
                    }
                }}
            />
        </div>
    )
}

export default Image
