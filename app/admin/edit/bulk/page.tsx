'use client'

import { FC, useState, useEffect, ChangeEvent } from 'react'
import { toast } from 'react-toastify'
import type { Category } from '@prisma/client'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Button from '@/components/Button'
import Link from '@/components/Link'
import styles from './page.module.scss'

const MEDIUM_OPTIONS = [
    { value: 'oil', label: 'Oil' },
    { value: 'acrylic', label: 'Acrylic' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'mixed', label: 'Mixed Media' },
]

interface FormData {
    name: string
    isFramed: boolean
    size: string
    medium: string
    price: string
    categoryId: string
    image: File | null
}

const BulkAddPage: FC = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [images, setImages] = useState<File[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        isFramed: false,
        size: '',
        medium: 'oil',
        price: '',
        categoryId: '',
        image: null,
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories')
                const data = await response.json()
                setCategories(data)
                if (data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        categoryId: data[0].id.toString(),
                    }))
                }
            } catch (error) {
                toast.error('Failed to fetch categories')
            }
        }
        fetchCategories()
    }, [])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileArray = Array.from(e.target.files)
            setImages(fileArray)
            setFormData(prev => ({ ...prev, image: fileArray[0] }))
        }
    }

    const handleInputChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }))
    }

    const handleSubmitCurrent = async () => {
        try {
            if (!formData.image || !formData.name || !formData.categoryId) {
                toast.error('Please fill in all required fields')
                return
            }

            const imageData = new FormData()
            imageData.append('name', formData.name)
            imageData.append('isFramed', formData.isFramed.toString())
            imageData.append('size', formData.size)
            imageData.append('medium', formData.medium)
            imageData.append('price', formData.price)
            imageData.append('categoryId', formData.categoryId)
            imageData.append('image', formData.image)

            const response = await fetch('/api/paintings', {
                method: 'POST',
                body: imageData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create painting')
            }

            toast.success('Painting created successfully')

            if (currentIndex < images.length - 1) {
                setCurrentIndex(prev => prev + 1)
                setFormData(prev => ({
                    ...prev,
                    name: '',
                    size: '',
                    price: '',
                    image: images[currentIndex + 1],
                }))
            } else {
                window.location.href = '/admin/edit'
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to create painting'
            )
        }
    }

    const categoryOptions = categories.map(category => ({
        value: category.id.toString(),
        label: category.name,
    }))

    return (
        <div className={styles.container}>
            <Heading>Bulk Add Paintings</Heading>

            {images.length === 0 ? (
                <div className={styles.upload}>
                    <Text>Upload multiple images to begin</Text>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className={styles.form}>
                    <div className={styles.preview}>
                        <img
                            src={
                                formData.image
                                    ? URL.createObjectURL(formData.image)
                                    : ''
                            }
                            alt="Preview"
                        />
                        <Text>
                            Image {currentIndex + 1} of {images.length}
                        </Text>
                    </div>

                    <div className={styles.fields}>
                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.checkboxField}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="isFramed"
                                    checked={formData.isFramed}
                                    onChange={handleInputChange}
                                />
                                Is Framed
                            </label>
                        </div>

                        <Input
                            label="Size (e.g., 24x36)"
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                        />

                        <Select
                            label="Medium"
                            name="medium"
                            value={formData.medium}
                            onChange={handleInputChange}
                            options={MEDIUM_OPTIONS}
                        />

                        <Input
                            label="Price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleInputChange}
                        />

                        <Select
                            label="Category"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            options={categoryOptions}
                            required
                        />

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
            )}
        </div>
    )
}

export default BulkAddPage
