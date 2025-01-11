'use client'

import { FC, useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import type { Category } from '@prisma/client'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Link from '@/components/Link'
import styles from './page.module.scss'

interface ImageData {
    file: File
    preview: string
    name: string
    description: string
    categoryId: string
}

const BulkAdd: FC = () => {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [images, setImages] = useState<ImageData[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            if (!res.ok) throw new Error('Failed to fetch categories')
            const data = await res.json()
            setCategories(data)
        } catch (error) {
            toast.error('Failed to fetch categories')
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newImages: ImageData[] = Array.from(files).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: '',
            description: '',
            categoryId: categories[0]?.id.toString() || '',
        }))

        setImages(prev => [...prev, ...newImages])
    }

    const handleSubmitCurrent = async () => {
        const current = images[currentIndex]
        if (!current) return

        const formData = new FormData()
        formData.append('image', current.file)
        formData.append('name', current.name)
        formData.append('description', current.description)
        formData.append('categoryId', current.categoryId)

        try {
            const res = await fetch('/api/paintings', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Failed to save painting')
            toast.success('Painting added')

            if (currentIndex === images.length - 1) {
                router.push('/admin/edit')
            } else {
                setCurrentIndex(prev => prev + 1)
            }
        } catch (error) {
            toast.error('Failed to save painting')
        }
    }

    const updateCurrentImage = (data: Partial<ImageData>) => {
        setImages(prev =>
            prev.map((img, i) =>
                i === currentIndex ? { ...img, ...data } : img
            )
        )
    }

    if (images.length === 0) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <Heading>Bulk Add Paintings</Heading>
                    <div className={styles.upload}>
                        <Text>Select multiple images to begin</Text>
                        <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </main>
        )
    }

    const currentImage = images[currentIndex]

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Heading>Bulk Add Paintings</Heading>
                <Text>
                    Image {currentIndex + 1} of {images.length}
                </Text>

                <div className={styles.content}>
                    <img
                        src={currentImage.preview}
                        alt="Preview"
                        className={styles.preview}
                    />

                    <div className={styles.form}>
                        <Input
                            type="text"
                            value={currentImage.name}
                            onChange={e =>
                                updateCurrentImage({ name: e.target.value })
                            }
                            placeholder="Painting name"
                            required
                        />
                        <Input
                            type="text"
                            value={currentImage.description}
                            onChange={e =>
                                updateCurrentImage({
                                    description: e.target.value,
                                })
                            }
                            placeholder="Description (optional)"
                        />
                        <select
                            value={currentImage.categoryId}
                            onChange={e =>
                                updateCurrentImage({
                                    categoryId: e.target.value,
                                })
                            }
                            className={styles.select}
                            required
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <div className={styles.actions}>
                            <Link href="/admin/edit">Cancel</Link>
                            <Button onClick={handleSubmitCurrent}>
                                {currentIndex === images.length - 1
                                    ? 'Finish'
                                    : 'Next'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default BulkAdd
