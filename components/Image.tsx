'use client'

import { FC } from 'react'
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
    // Get URLs for all quality levels
    const getUrl = (quality: 'low' | 'mid' | 'high') =>
        Array.isArray(image)
            ? createImageUrl(image, quality)
            : image[quality].url

    return (
        <div className={classes(styles.wrapper, className)}>
            <NextImage
                src={getUrl('high')}
                alt={alt}
                className={styles.image}
                width={1000}
                height={1000}
                quality={100}
                placeholder="blur"
                blurDataURL={getUrl('low')}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={e => {
                    // Fallback to mid quality if high fails
                    const img = e.target as HTMLImageElement
                    if (img.src !== getUrl('mid')) {
                        img.src = getUrl('mid')
                    }
                }}
            />
        </div>
    )
}

export default Image
