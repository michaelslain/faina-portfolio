import { FC } from 'react'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import type { Painting as PaintingType } from '@prisma/client'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Button from '@/components/Button'
import Image from '@/components/Image'
import styles from './page.module.scss'

interface PageProps {
    params: {
        id: string
    }
}

// Type for painting with imageUrls
type SerializedPainting = Omit<PaintingType, 'imageUrls'> & {
    category: { name: string }
    imageUrls: {
        low: { url: string }
        mid: { url: string }
        high: { url: string }
    }
}

async function getData(id: string): Promise<SerializedPainting> {
    const painting = await prisma.painting.findUnique({
        where: { id: parseInt(id) },
        include: { category: true },
    })

    if (!painting) notFound()

    // Parse the JSON value to ensure it matches our type
    const imageUrls = painting.imageUrls as {
        low: { url: string }
        mid: { url: string }
        high: { url: string }
    }

    return {
        ...painting,
        imageUrls,
    } as SerializedPainting
}

const Page: FC<PageProps> = async ({ params }) => {
    const { id } = await params
    const painting = await getData(id)

    return (
        <main className={styles.container}>
            <Button href="/" useLink className={styles.back}>
                ← Back to Gallery
            </Button>
            <div className={styles.content}>
                <div className={styles.imageContainer}>
                    <Image
                        image={painting.imageUrls}
                        alt={painting.name}
                        className={styles.image}
                        priority
                    />
                </div>
                <div className={styles.info}>
                    <Heading className={styles.heading}>
                        {painting.name}
                    </Heading>
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
        </main>
    )
}

export default Page
