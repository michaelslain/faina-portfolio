import { FC } from 'react'
import styles from './Heading.module.scss'
import classes from '@/utils/classes'

interface HeadingProps {
    children: React.ReactNode
    className?: string
    size?: 'h1' | 'h2' | 'h3'
    special?: boolean
}

const Heading: FC<HeadingProps> = ({
    children,
    className,
    size = 'h1',
    special = false,
}) => {
    const Component = size
    return (
        <Component
            className={classes(
                styles.heading,
                styles[size],
                special && styles.special,
                className
            )}
        >
            {children}
        </Component>
    )
}

export default Heading
