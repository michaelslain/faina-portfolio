import { FC } from 'react'
import type { Category, Painting as PaintingType } from '@prisma/client'
import prisma from '@/lib/prisma'
import Heading from '@/components/Heading'
import Painting from '@/components/Painting'
import EmptyText from '@/components/EmptyText'
import Link from '@/components/Link'
import styles from './page.module.scss'

interface HomeProps {
    searchParams: { category?: string }
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

const Home: FC<HomeProps> = async ({ searchParams }) => {
    // Ensure searchParams.category is a string or undefined
    const selectedCategory = searchParams?.category?.toString()
    const { categories, serializedPaintings } = await getData(selectedCategory)

    const isActive = (category?: string) => {
        if (!category) return !selectedCategory
        return selectedCategory === category
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Heading>Portfolio</Heading>
                <div className={styles.tabs}>
                    <Link
                        href="/"
                        className={styles.tab}
                        data-active={isActive(undefined)}
                    >
                        All
                    </Link>
                    {categories.map(category => (
                        <Link
                            key={category.id}
                            href={`/?category=${category.name}`}
                            className={styles.tab}
                            data-active={isActive(category.name)}
                        >
                            {category.name}
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

export default Home
