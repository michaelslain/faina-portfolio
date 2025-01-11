'use client'

import { ButtonHTMLAttributes, FC } from 'react'
import classes from '@/utils/classes'
import styles from './Button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
}

const Button: FC<ButtonProps> = ({ className, ...props }) => {
    return <button className={classes(styles.button, className)} {...props} />
}

export default Button
