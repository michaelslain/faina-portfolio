'use client'

import { FC, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import type { Category, Painting } from '@prisma/client'
import type { ProcessedImage } from '@/types/image'
import { createImageUrl } from '@/utils/image'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Button from '@/components/Button'
import Link from '@/components/Link'
import styles from './page.module.scss'

interface PaintingWithCategory extends Painting {
    category: Category
    processedImages?: {
        low: ProcessedImage
        mid: ProcessedImage
        high: ProcessedImage
    }
}

const AdminEdit: FC = () => {
    const router = useRouter()
    const [paintings, setPaintings] = useState<PaintingWithCategory[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const fetchData = async () => {
        try {
            const [paintingsRes, categoriesRes] = await Promise.all([
                fetch('/api/paintings'),
                fetch('/api/categories'),
            ])
            const [paintingsData, categoriesData] = await Promise.all([
                paintingsRes.json(),
                categoriesRes.json(),
            ])
            setPaintings(paintingsData)
            setCategories(categoriesData)
        } catch (error) {
            toast.error('Failed to fetch data')
        }
    }

    const handleDeletePainting = async (id: number) => {
        if (!confirm('Are you sure you want to delete this painting?')) return

        try {
            const res = await fetch(`/api/paintings`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })

            if (!res.ok) throw new Error('Failed to delete painting')
            toast.success('Painting deleted')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete painting')
        }
    }

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return

        try {
            const res = await fetch(`/api/categories`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })

            if (!res.ok) throw new Error('Failed to delete category')
            toast.success('Category deleted')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete category')
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Heading>Admin Dashboard</Heading>
                    <Button
                        onClick={() => router.push('/admin/instructions')}
                        className={styles.help}
                    >
                        If you forgot what to do, click here
                    </Button>
                    <div className={styles.actions}>
                        <Button
                            onClick={() =>
                                router.push('/admin/edit/painting/new')
                            }
                        >
                            Add Single Painting
                        </Button>
                        <Button onClick={() => router.push('/admin/edit/bulk')}>
                            Bulk Add Paintings
                        </Button>
                        <Button
                            onClick={() =>
                                router.push('/admin/edit/category/new')
                            }
                        >
                            Add Category
                        </Button>
                    </div>
                </div>

                <section className={styles.section}>
                    <Heading size="h2">Categories</Heading>
                    <div className={styles.grid}>
                        {categories.map(category => (
                            <div key={category.id} className={styles.item}>
                                <Heading size="h3">{category.name}</Heading>
                                <div className={styles.itemActions}>
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                `/admin/edit/category/${category.id}`
                                            )
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleDeleteCategory(category.id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <Heading size="h2">Paintings</Heading>
                    <div className={styles.grid}>
                        {paintings.map(painting => (
                            <div key={painting.id} className={styles.item}>
                                <img
                                    src={
                                        painting.processedImages?.low.url ||
                                        createImageUrl(painting.image as any)
                                    }
                                    alt={painting.name}
                                    className={styles.thumbnail}
                                />
                                <Heading size="h3">{painting.name}</Heading>
                                <Text>{painting.category.name}</Text>
                                <div className={styles.itemActions}>
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                `/admin/edit/painting/${painting.id}`
                                            )
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleDeletePainting(painting.id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default AdminEdit
