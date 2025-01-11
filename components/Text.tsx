import { FC } from 'react'
import styles from './Text.module.scss'
import classes from '@/utils/classes'

interface TextProps {
    children: React.ReactNode
    className?: string
}

const Text: FC<TextProps> = ({ children, className }) => {
    return <p className={classes(styles.text, className)}>{children}</p>
}

export default Text
