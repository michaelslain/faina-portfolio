'use client'

import { FC, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import type { Category } from '@prisma/client'
import type { ImageUploadResult } from '@/types/image'
import { use } from 'react'
import Heading from '@/components/Heading'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Link from '@/components/Link'
import ImageUpload from '@/components/ImageUpload'
import styles from './page.module.scss'

interface PaintingEditProps {
    params: Promise<{
        id: string
    }>
}

const PaintingEdit: FC<PaintingEditProps> = props => {
    const router = useRouter()
    const params = use(props.params)
    const isNew = params.id === 'new'
    const [categories, setCategories] = useState<Category[]>([])

    // Separate state for each field
    const [name, setName] = useState('')
    const [isFramed, setIsFramed] = useState(false)
    const [size, setSize] = useState('')
    const [medium, setMedium] = useState('oil')
    const [price, setPrice] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [uploadResult, setUploadResult] = useState<ImageUploadResult>()
    const [preview, setPreview] = useState<string>('')

    useEffect(() => {
        fetchCategories()
        if (!isNew) {
            fetchPainting()
        }
    }, [isNew])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            if (!res.ok) throw new Error('Failed to fetch categories')
            const data = await res.json()
            setCategories(data)
            if (data.length > 0 && isNew) {
                setCategoryId(data[0].id.toString())
            }
        } catch (error) {
            toast.error('Failed to fetch categories')
        }
    }

    const fetchPainting = async () => {
        try {
            const res = await fetch(`/api/paintings/${params.id}`)
            if (!res.ok) throw new Error('Failed to fetch painting')
            const data = await res.json()

            setName(data.name)
            setIsFramed(data.isFramed || false)
            setSize(data.size || '')
            setMedium(data.medium || 'oil')
            setPrice(data.price?.toString() || '')
            setCategoryId(data.categoryId.toString())

            // Set preview from processed images if available, otherwise use database image
            if (data.processedImages?.high) {
                setPreview(data.processedImages.high.url)
            } else {
                setPreview(
                    `data:image/jpeg;base64,${Buffer.from(data.image).toString(
                        'base64'
                    )}`
                )
            }
        } catch (error) {
            toast.error('Failed to fetch painting')
            router.push('/admin/edit')
        }
    }

    const handleImageUpload = (result: ImageUploadResult) => {
        setUploadResult(result)
        setPreview(result.resolutions.high.url)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!uploadResult && isNew) {
            toast.error('Please select an image')
            return
        }

        try {
            console.log('Submitting data:', {
                name,
                isFramed,
                size,
                medium,
                price,
                categoryId,
                hasUploadResult: !!uploadResult,
                uploadResultStructure: uploadResult
                    ? {
                          hasResolutions: !!uploadResult.resolutions,
                          hasHigh: !!uploadResult.resolutions?.high,
                          hasUrl: !!uploadResult.resolutions?.high?.url,
                      }
                    : null,
            })

            const res = await fetch('/api/paintings', {
                method: isNew ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: isNew ? undefined : parseInt(params.id),
                    name,
                    isFramed,
                    size,
                    medium,
                    price: parseFloat(price) || 0,
                    categoryId: parseInt(categoryId),
                    imageUpload: uploadResult,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to save painting')
            }
            toast.success(`Painting ${isNew ? 'created' : 'updated'}`)
            router.push('/admin/edit')
        } catch (error) {
            toast.error(`Failed to ${isNew ? 'create' : 'update'} painting`)
        }
    }

    return (
        <main className={styles.container}>
            <div className={styles.container}>
                <Heading>{isNew ? 'Add Painting' : 'Edit Painting'}</Heading>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Painting name"
                        required
                    />
                    <div className={styles.checkboxField}>
                        <label>
                            <input
                                type="checkbox"
                                checked={isFramed}
                                onChange={e => setIsFramed(e.target.checked)}
                            />
                            Is Framed
                        </label>
                    </div>
                    <Input
                        type="text"
                        value={size}
                        onChange={e => setSize(e.target.value)}
                        placeholder="Size (e.g., 24x36)"
                        required
                    />
                    <select
                        value={medium}
                        onChange={e => setMedium(e.target.value)}
                        className={styles.select}
                        required
                    >
                        <option value="oil">Oil</option>
                        <option value="acrylic">Acrylic</option>
                        <option value="watercolor">Watercolor</option>
                        <option value="pastel">Pastel</option>
                        <option value="mixed">Mixed Media</option>
                    </select>
                    <Input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="Price"
                        required
                        step="0.01"
                        min="0"
                    />
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className={styles.select}
                        required
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <ImageUpload
                        onUpload={handleImageUpload}
                        className={styles.upload}
                    />
                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className={styles.preview}
                        />
                    )}
                    <div className={styles.actions}>
                        <Link href="/admin/edit">Cancel</Link>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default PaintingEdit
