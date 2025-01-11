'use client'

import { FC, useState } from 'react'
import Heading from '@/components/Heading'
import Text from '@/components/Text'
import Link from '@/components/Link'
import Button from '@/components/Button'
import styles from './page.module.scss'

const translations = {
    english: {
        title: 'How to Use Admin Panel',
        addOne: {
            title: 'Add One Painting',
            steps: [
                'Click "Add Painting"',
                'Fill in name and description',
                'Pick a category',
                'Upload one photo',
                'Click "Save"',
            ],
        },
        addMany: {
            title: 'Add Many Paintings',
            steps: [
                'Click "Bulk Add Paintings"',
                'Select many photos at once',
                'For each photo:',
                '- Add name and description',
                '- Pick a category',
                '- Click "Next"',
            ],
        },
        edit: {
            title: 'Edit a Painting',
            steps: [
                'Find the painting you want to change',
                'Click "Edit" under that painting',
                'Change what you need',
                'Click "Save"',
            ],
        },
        delete: {
            title: 'Delete a Painting',
            steps: [
                'Find the painting you want to remove',
                'Click "Delete"',
                'Click "OK" to confirm',
            ],
        },
        addCategory: {
            title: 'Add a Category',
            steps: [
                'Click "Add Category"',
                'Type the category name',
                'Click "Save"',
            ],
        },
        back: 'Back to Admin Panel',
    },
    russian: {
        title: 'Как Использовать Панель Администратора',
        addOne: {
            title: 'Добавить Одну Картину',
            steps: [
                'Нажмите "Add Painting"',
                'Заполните название и описание',
                'Выберите категорию',
                'Загрузите одно фото',
                'Нажмите "Save"',
            ],
        },
        addMany: {
            title: 'Добавить Несколько Картин',
            steps: [
                'Нажмите "Bulk Add Paintings"',
                'Выберите несколько фотографий',
                'Для каждого фото:',
                '- Добавьте название и описание',
                '- Выберите категорию',
                '- Нажмите "Next"',
            ],
        },
        edit: {
            title: 'Изменить Картину',
            steps: [
                'Найдите картину, которую хотите изменить',
                'Нажмите "Edit" под картиной',
                'Внесите нужные изменения',
                'Нажмите "Save"',
            ],
        },
        delete: {
            title: 'Удалить Картину',
            steps: [
                'Найдите картину, которую хотите удалить',
                'Нажмите "Delete"',
                'Нажмите "OK" для подтверждения',
            ],
        },
        addCategory: {
            title: 'Добавить Категорию',
            steps: [
                'Нажмите "Add Category"',
                'Введите название категории',
                'Нажмите "Save"',
            ],
        },
        back: 'Вернуться в Панель Администратора',
    },
}

const Instructions: FC = () => {
    const [language, setLanguage] = useState<'english' | 'russian'>('english')
    const t = translations[language]

    return (
        <div className={styles.container}>
            <Link href="/admin/edit" className={styles.back}>
                {t.back}
            </Link>

            <div className={styles.languageSwitch}>
                <Button
                    onClick={() => setLanguage('english')}
                    className={language === 'english' ? styles.active : ''}
                >
                    English
                </Button>
                <Button
                    onClick={() => setLanguage('russian')}
                    className={language === 'russian' ? styles.active : ''}
                >
                    Русский
                </Button>
            </div>

            <Heading>{t.title}</Heading>

            <div className={styles.section}>
                <Heading size="h2">{t.addOne.title}</Heading>
                {t.addOne.steps.map((step, index) => (
                    <Text key={index}>
                        {index + 1}. {step}
                    </Text>
                ))}
            </div>

            <div className={styles.section}>
                <Heading size="h2">{t.addMany.title}</Heading>
                {t.addMany.steps.map((step, index) => (
                    <Text key={index}>
                        {step.startsWith('-') ? step : `${index + 1}. ${step}`}
                    </Text>
                ))}
            </div>

            <div className={styles.section}>
                <Heading size="h2">{t.edit.title}</Heading>
                {t.edit.steps.map((step, index) => (
                    <Text key={index}>
                        {index + 1}. {step}
                    </Text>
                ))}
            </div>

            <div className={styles.section}>
                <Heading size="h2">{t.delete.title}</Heading>
                {t.delete.steps.map((step, index) => (
                    <Text key={index}>
                        {index + 1}. {step}
                    </Text>
                ))}
            </div>

            <div className={styles.section}>
                <Heading size="h2">{t.addCategory.title}</Heading>
                {t.addCategory.steps.map((step, index) => (
                    <Text key={index}>
                        {index + 1}. {step}
                    </Text>
                ))}
            </div>

            <Link href="/admin/edit" className={styles.back}>
                {t.back}
            </Link>
        </div>
    )
}

export default Instructions
