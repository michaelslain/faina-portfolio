import { FC } from 'react'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import type { Painting as PaintingType } from '@prisma/client'
import type { ProcessedImage } from '@/types/image'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Link from '@/components/Link'
import Painting from '@/components/Painting'
import styles from './page.module.scss'

interface PageProps {
    params: {
        id: string
    }
}

// Type for painting with serialized image and processed images
type SerializedPainting = Omit<PaintingType, 'image'> & {
    image: number[]
    category: { name: string }
    processedImages?: {
        low: ProcessedImage
        mid: ProcessedImage
        high: ProcessedImage
    }
}

async function getData(id: string): Promise<SerializedPainting> {
    const painting = await prisma.painting.findUnique({
        where: { id: parseInt(id) },
        include: { category: true },
    })

    if (!painting) notFound()

    // Convert image Buffer to Array for proper serialization
    return {
        ...painting,
        image: Array.from(painting.image),
    }
}

const Page: FC<PageProps> = async ({ params }) => {
    const { id } = await params
    const painting = await getData(id)

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Link href="/" className={styles.back}>
                    <Text>← Back to Gallery</Text>
                </Link>
                <div className={styles.content}>
                    <div className={styles.imageContainer}>
                        <Painting
                            painting={painting}
                            showFullQuality={true}
                            className={styles.image}
                        />
                    </div>
                    <div className={styles.info}>
                        <Heading>{painting.name}</Heading>
                        <div className={styles.details}>
                            <div className={styles.detail}>
                                <Text className={styles.label}>Category:</Text>
                                <Text>{painting.category.name}</Text>
                            </div>
                            <div className={styles.detail}>
                                <Text className={styles.label}>Medium:</Text>
                                <Text>{painting.medium}</Text>
                            </div>
                            <div className={styles.detail}>
                                <Text className={styles.label}>Size:</Text>
                                <Text>{painting.size}</Text>
                            </div>
                            <div className={styles.detail}>
                                <Text className={styles.label}>Framed:</Text>
                                <Text>{painting.isFramed ? 'Yes' : 'No'}</Text>
                            </div>
                            <div className={styles.detail}>
                                <Text className={styles.label}>Price:</Text>
                                <Text>${painting.price.toLocaleString()}</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Page
