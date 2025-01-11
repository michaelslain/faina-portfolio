/**
 * Converts an array buffer to base64 string by processing in chunks
 * to prevent call stack overflow with large images
 */
export function arrayBufferToBase64(buffer: number[]) {
    const chunks = 1024
    let binary = ''
    for (let i = 0; i < buffer.length; i += chunks) {
        const slice = buffer.slice(i, i + chunks)
        binary += String.fromCharCode.apply(null, slice)
    }
    return btoa(binary)
}

/**
 * Creates a data URL for an image from its binary data
 */
export function createImageUrl(
    imageData: number[],
    quality: 'low' | 'high' = 'high'
) {
    const base64 = arrayBufferToBase64(imageData)
    return `data:image/jpeg;base64,${base64}`
}

/**
 * Compresses an image to a lower quality for thumbnails
 */
export async function compressImage(file: File): Promise<Blob> {
    return new Promise(resolve => {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!

            // Calculate new dimensions (max 400px width for thumbnails)
            const maxWidth = 400
            const ratio = maxWidth / img.width
            canvas.width = maxWidth
            canvas.height = img.height * ratio

            // Draw and compress
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            canvas.toBlob(
                blob => resolve(blob!),
                'image/jpeg',
                0.6 // 60% quality
            )
        }
    })
}
