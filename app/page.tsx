import { FC } from 'react'
import type { Category, Painting as PaintingType } from '@prisma/client'
import prisma from '@/lib/prisma'
import Heading from '@/components/Heading'
import Painting from '@/components/Painting'
import EmptyText from '@/components/EmptyText'
import Tab from '@/components/Tab'
import styles from './page.module.scss'
import Text from '@/components/Text'

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

    // Get categories first
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    })

    // Then get paintings based on selected category
    const paintings = await prisma.painting.findMany({
        where: selectedCategory
            ? {
                  category: { name: selectedCategory },
              }
            : undefined,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: PAINTINGS_PER_PAGE,
    })

    // Convert image Buffer to Array for proper serialization
    const serializedPaintings: SerializedPainting[] = paintings.map(
        painting => ({
            ...painting,
            image: Array.from(painting.image),
        })
    )

    return { categories, serializedPaintings }
}

export async function generateMetadata({ searchParams }: PageProps) {
    const params = await searchParams
    const category =
        typeof params.category === 'string' ? params.category : 'All Paintings'

    return {
        title: `Faina Slain - ${category}`,
        description: `View ${category} paintings by Faina Slain`,
    }
}

const Page: FC<PageProps> = async ({ searchParams }) => {
    const params = await searchParams
    const category =
        typeof params.category === 'string' ? params.category : undefined

    const { categories, serializedPaintings } = await getData(category)

    const isActive = (cat?: string) => {
        if (!cat) return !category
        return category === cat
    }

    // Sort categories to put the active one first
    const sortedCategories = [...categories].sort((a, b) => {
        if (a.name === category) return -1
        if (b.name === category) return 1
        return a.name.localeCompare(b.name)
    })

    return (
        <main className={styles.container}>
            <div className={styles.intro}>
                <Heading special className={styles.heading}>
                    Faina Slain
                </Heading>
                <Text className={styles.description}>
                    Artist based in SF Bay Area <br />
                    Contact at: <u>faina@fainaslain.com</u>
                </Text>
            </div>
            <div className={styles.tabs}>
                <Tab
                    href="/"
                    label="All"
                    isActive={isActive(undefined)}
                    className={styles.tab}
                />
                {sortedCategories.map(cat => (
                    <Tab
                        key={cat.id}
                        href={`/?category=${cat.name}`}
                        label={cat.name}
                        isActive={isActive(cat.name)}
                        className={styles.tab}
                    />
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
        </main>
    )
}

export default Page
