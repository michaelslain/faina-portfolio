import { FC } from 'react'
import NextLink from 'next/link'
import styles from './Link.module.scss'
import classes from '@/utils/classes'

interface LinkProps {
    children: React.ReactNode
    href: string
    className?: string
}

const Link: FC<LinkProps> = ({ children, href, className }) => {
    return (
        <NextLink href={href} className={classes(styles.link, className)}>
            {children}
        </NextLink>
    )
}

export default Link
