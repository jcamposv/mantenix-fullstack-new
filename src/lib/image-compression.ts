export async function compressImage(file: File, maxSizeMB = 5, maxWidthOrHeight = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidthOrHeight) {
          height = (height * maxWidthOrHeight) / width
          width = maxWidthOrHeight
        }
      } else {
        if (height > maxWidthOrHeight) {
          width = (width * maxWidthOrHeight) / height
          height = maxWidthOrHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Start with high quality and reduce if needed
      let quality = 0.9
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            const maxSizeBytes = maxSizeMB * 1024 * 1024
            
            if (blob.size <= maxSizeBytes || quality <= 0.1) {
              // Create new file with compressed blob
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              // Reduce quality and try again
              quality -= 0.1
              tryCompress()
            }
          },
          file.type,
          quality
        )
      }

      tryCompress()
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export function shouldCompressImage(file: File): boolean {
  const isImage = file.type.startsWith('image/')
  const isLarge = file.size > 2 * 1024 * 1024 // > 2MB
  const isCompressibleType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  
  return isImage && isLarge && isCompressibleType
}