'use client'

import { FC, FormEvent, useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Heading from '@/components/Heading'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Link from '@/components/Link'
import styles from './page.module.scss'

interface CategoryEditProps {
    params: Promise<{
        id: string
    }>
}

const CategoryEdit: FC<CategoryEditProps> = props => {
    const router = useRouter()
    const { id } = use(props.params)
    const isNew = id === 'new'
    const [name, setName] = useState('')

    useEffect(() => {
        if (!isNew) {
            fetchCategory()
        }
    }, [isNew])

    const fetchCategory = async () => {
        try {
            const res = await fetch(`/api/categories/${id}`)
            if (!res.ok) throw new Error('Failed to fetch category')
            const data = await res.json()
            setName(data.name)
        } catch (error) {
            toast.error('Failed to fetch category')
            router.push('/admin/edit')
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/categories', {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: isNew ? undefined : parseInt(id),
                    name,
                }),
            })

            if (!res.ok) throw new Error('Failed to save category')
            toast.success(`Category ${isNew ? 'created' : 'updated'}`)
            router.push('/admin/edit')
        } catch (error) {
            toast.error(`Failed to ${isNew ? 'create' : 'update'} category`)
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Heading>{isNew ? 'Add Category' : 'Edit Category'}</Heading>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Category name"
                        required
                    />
                    <div className={styles.actions}>
                        <Button onClick={() => router.push('/admin/edit')}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default CategoryEdit
