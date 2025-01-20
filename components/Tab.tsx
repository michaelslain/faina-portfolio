'use client'

import { FC } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import classes from '@/utils/classes'
import styles from './Tab.module.scss'

interface TabProps {
    label: string
    isActive?: boolean
    onClick?: () => void
    href?: string
    className?: string
    active?: boolean
}

const Tab: FC<TabProps> = ({
    label,
    isActive,
    onClick,
    href,
    className,
    active = false,
}) => {
    const commonProps = {
        className: classes(
            styles.tab,
            (isActive || active) && styles.active,
            className
        ),
    }

    if (href) {
        return (
            <Link href={href} {...commonProps}>
                {label}
            </Link>
        )
    }

    return (
        <Button {...commonProps} onClick={onClick}>
            {label}
        </Button>
    )
}

export default Tab
