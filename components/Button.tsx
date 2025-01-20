'use client'

import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import Link from '@/components/Link'
import classes from '@/utils/classes'
import styles from './Button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    href?: string
    useLink?: boolean
    children: ReactNode
}

const Button: FC<ButtonProps> = ({
    className,
    href,
    useLink,
    children,
    ...props
}) => {
    const commonProps = {
        className: classes(styles.button, className),
    }

    if (useLink && href) {
        return (
            <Link href={href} {...commonProps}>
                {children}
            </Link>
        )
    }

    return (
        <button {...commonProps} {...props}>
            {children}
        </button>
    )
}

export default Button
