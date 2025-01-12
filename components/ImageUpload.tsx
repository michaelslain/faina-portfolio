'use client'

import { FC, useState, useRef } from 'react'
import type { ImageUploadResult } from '@/types/image'
import styles from './ImageUpload.module.scss'

interface ImageUploadProps {
    onUpload: (result: ImageUploadResult) => void
    className?: string
}

const ImageUpload: FC<ImageUploadProps> = ({ onUpload, className }) => {
    const [isUploading, setIsUploading] = useState(false)
    const [preview, setPreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload file
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const result = await response.json()
            onUpload(result)
        } catch (error) {
            console.error('Upload error:', error)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            setPreview('')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={`${styles.container} ${className || ''}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={isUploading}
                className={styles.input}
            />
            {preview && (
                <div className={styles.preview}>
                    <img src={preview} alt="Preview" />
                </div>
            )}
            {isUploading && (
                <div className={styles.uploading}>
                    <div className={styles.spinner} />
                    <p>Uploading...</p>
                </div>
            )}
        </div>
    )
}

export default ImageUpload
