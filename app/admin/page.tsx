'use client'

import { FC, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Heading from '@/components/Heading'
import Input from '@/components/Input'
import Button from '@/components/Button'
import styles from './page.module.scss'

const Admin: FC = () => {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Check if already logged in
    fetch('/api/login', { method: 'GET' }).then(res => {
        if (res.ok) {
            router.replace('/admin/edit')
        }
    })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            router.push('/admin/edit')
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Invalid password'
            )
            setIsLoading(false)
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Heading>Admin Login</Heading>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Login'}
                    </Button>
                </form>
            </div>
        </main>
    )
}

export default Admin
