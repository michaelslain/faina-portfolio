'use client'

import { FC } from 'react'
import { classes } from '@/utils/classes'
import styles from './Tab.module.scss'

interface TabProps {
    label: string
    isActive?: boolean
    onClick?: () => void
    className?: string
}

const Tab: FC<TabProps> = ({ label, isActive, onClick, className }) => {
    return (
        <button
            className={classes(
                styles.tab,
                isActive && styles.active,
                className
            )}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

export default Tab
