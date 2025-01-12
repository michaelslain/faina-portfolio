'use client'

import { FC, useState, useEffect, ChangeEvent } from 'react'
import { toast } from 'react-toastify'
import type { Category } from '@prisma/client'
import type { ImageUploadResult } from '@/types/image'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Button from '@/components/Button'
import Link from '@/components/Link'
import ImageUpload from '@/components/ImageUpload'
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
    uploadResult?: ImageUploadResult
}

const BulkAddPage: FC = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        isFramed: false,
        size: '',
        medium: 'oil',
        price: '',
        categoryId: '',
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

    const handleImageUpload = (result: ImageUploadResult) => {
        setFormData(prev => ({
            ...prev,
            uploadResult: result,
        }))
    }

    const handleSubmitCurrent = async () => {
        try {
            if (
                !formData.uploadResult ||
                !formData.name ||
                !formData.categoryId
            ) {
                toast.error('Please fill in all required fields')
                return
            }

            const response = await fetch('/api/paintings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    isFramed: formData.isFramed,
                    size: formData.size,
                    medium: formData.medium,
                    price: parseFloat(formData.price) || 0,
                    categoryId: parseInt(formData.categoryId),
                    imageUpload: formData.uploadResult,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create painting')
            }

            toast.success('Painting created successfully')

            // Reset form for next painting
            setFormData(prev => ({
                ...prev,
                name: '',
                size: '',
                price: '',
                uploadResult: undefined,
            }))
            setCurrentIndex(prev => prev + 1)
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
            <Heading>Add Painting</Heading>
            <div className={styles.form}>
                <ImageUpload
                    onUpload={handleImageUpload}
                    className={styles.upload}
                />

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
                        <Button onClick={handleSubmitCurrent}>Save</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BulkAddPage
