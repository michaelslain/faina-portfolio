import { FC, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from './Input.module.scss'
import classes from '@/utils/classes'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string
    label?: string
    multiline?: boolean
}

type TextareaProps = Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    keyof InputProps
> &
    InputProps

const Input: FC<InputProps & TextareaProps> = ({
    className,
    label,
    multiline,
    ...props
}) => {
    const inputClasses = classes(styles.input, className)

    if (multiline) {
        return (
            <div className={styles.field}>
                {label && <label className={styles.label}>{label}</label>}
                <textarea
                    className={classes(inputClasses, styles.textarea)}
                    {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            </div>
        )
    }

    return (
        <div className={styles.field}>
            {label && <label className={styles.label}>{label}</label>}
            <input className={inputClasses} {...props} />
        </div>
    )
}

export default Input
