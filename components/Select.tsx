import { FC, SelectHTMLAttributes } from 'react'
import styles from './Select.module.scss'
import classes from '@/utils/classes'

interface Option {
    value: string
    label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: Option[]
    label?: string
    className?: string
}

const Select: FC<SelectProps> = ({ options, label, className, ...props }) => {
    return (
        <div className={styles.field}>
            {label && <label className={styles.label}>{label}</label>}
            <select className={classes(styles.select, className)} {...props}>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default Select
