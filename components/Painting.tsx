'use client'

import { FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Painting as PaintingType } from '@prisma/client'
import { createImageUrl } from '@/utils/image'
import styles from './Painting.module.scss'
import classes from '@/utils/classes'

// Type for painting with serialized image
type SerializedPainting = Omit<PaintingType, 'image'> & {
    image: number[]
    category: { name: string }
}

interface PaintingProps {
    painting?: SerializedPainting
    className?: string
    showFullQuality?: boolean
    priority?: boolean
}

const Painting: FC<PaintingProps> = ({
    painting,
    className,
    showFullQuality = false,
    priority = false,
}) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    if (!painting) {
        return <div className={classes(styles.painting, className)} />
    }

    const imageUrl = createImageUrl(
        painting.image,
        showFullQuality ? 'high' : 'low'
    )

    const handleClick = () => {
        if (showFullQuality) {
            // Open full quality image in new tab
            window.open(imageUrl, '_blank')
        } else {
            router.push(`/painting/${painting.id}`)
        }
    }

    return (
        <div
            className={classes(styles.container, className)}
            onClick={handleClick}
            role="button"
            tabIndex={0}
        >
            {isLoading && (
                <div className={styles.loader}>
                    <div className={styles.spinner} />
                </div>
            )}
            <div className={styles.imageWrapper}>
                <Image
                    src={imageUrl}
                    alt={painting.name}
                    className={classes(
                        styles.painting,
                        isLoading && styles.loading
                    )}
                    onLoad={() => setIsLoading(false)}
                    fill
                    unoptimized
                    loading={priority ? 'eager' : 'lazy'}
                />
            </div>
        </div>
    )
}

export default Painting
