import { FC } from 'react'
import styles from './EmptyText.module.scss'
import classes from '@/utils/classes'

interface EmptyTextProps {
    children: React.ReactNode
    className?: string
}

const EmptyText: FC<EmptyTextProps> = ({ children, className }) => {
    return <p className={classes(styles.text, className)}>{children}</p>
}

export default EmptyText
