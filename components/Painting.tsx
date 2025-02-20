'use client'

import { FC } from 'react'
import { useRouter } from 'next/navigation'
import type { Painting as PaintingType } from '@prisma/client'
import styles from './Painting.module.scss'
import classes from '@/utils/classes'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Image from '@/components/Image'

// Type for painting with processed images
type SerializedPainting = Omit<PaintingType, 'imageUrls'> & {
    category: { name: string }
    processedImages: {
        low: { url: string }
        mid: { url: string }
        high: { url: string }
    }
}

interface PaintingProps {
    painting?: SerializedPainting
    className?: string
    priority?: boolean
}

const Painting: FC<PaintingProps> = ({
    painting,
    className,
    priority = false,
}) => {
    const router = useRouter()

    if (!painting) {
        return <div className={classes(styles.painting, className)} />
    }

    const handleClick = () => {
        router.push(`/painting/${painting.id}`)
    }

    return (
        <div
            className={classes(styles.container, className)}
            onClick={handleClick}
        >
            <div className={styles.imageWrapper}>
                <Image
                    image={painting.processedImages}
                    alt={painting.name}
                    className={styles.painting}
                    priority={priority}
                />
            </div>
            <div className={styles.info}>
                <Heading size="h3" className={styles.name}>
                    {painting.name}
                </Heading>
                <Text className={styles.price}>
                    ${painting.price.toFixed(2).toLocaleString()}
                </Text>
            </div>
        </div>
    )
}

export default Painting
