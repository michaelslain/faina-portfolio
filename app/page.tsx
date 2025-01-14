import { FC } from 'react'
import type { Category, Painting as PaintingType } from '@prisma/client'
import prisma from '@/lib/prisma'
import Heading from '@/components/Heading'
import Painting from '@/components/Painting'
import EmptyText from '@/components/EmptyText'
import Link from '@/components/Link'
import styles from './page.module.scss'

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

// Type for serialized painting with image as number array
interface SerializedPainting extends Omit<PaintingType, 'image'> {
    image: number[]
    category: Category
}

async function getData(selectedCategory?: string) {
    // Limit the number of paintings per page for better performance
    const PAINTINGS_PER_PAGE = 12

    const [categories, paintings] = await Promise.all([
        prisma.category.findMany({
            orderBy: { name: 'asc' },
        }),
        prisma.painting.findMany({
            where: selectedCategory
                ? {
                      category: { name: selectedCategory },
                  }
                : undefined,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            take: PAINTINGS_PER_PAGE,
        }),
    ])

    // Convert image Buffer to Array for proper serialization
    const serializedPaintings: SerializedPainting[] = paintings.map(
        painting => ({
            ...painting,
            image: Array.from(painting.image),
        })
    )

    return { categories, serializedPaintings }
}

const Page: FC<PageProps> = async ({ searchParams }) => {
    // Get the category from searchParams, ensuring it's a string
    const category =
        typeof searchParams.category === 'string'
            ? searchParams.category
            : undefined

    const { categories, serializedPaintings } = await getData(category)

    const isActive = (cat?: string) => {
        if (!cat) return !category
        return category === cat
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Heading special>Faina Slain</Heading>
                <div className={styles.tabs}>
                    <Link
                        href="/"
                        className={styles.tab}
                        data-active={isActive(undefined)}
                    >
                        All
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            href={`/?category=${cat.name}`}
                            className={styles.tab}
                            data-active={isActive(cat.name)}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
                <div className={styles.grid}>
                    {serializedPaintings.length > 0 ? (
                        serializedPaintings.map((painting, index) => (
                            <Painting
                                key={painting.id}
                                painting={painting}
                                priority={index < 3} // Only prioritize first 3 images
                            />
                        ))
                    ) : (
                        <EmptyText>No paintings to display</EmptyText>
                    )}
                </div>
            </div>
        </main>
    )
}

export default Page
