import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void
  multiple?: boolean
  accept?: Record<string, string[]>
  maxFiles?: number
  className?: string
}

// Minimal drag&drop without react-dropzone (not installed)
export function ImageUploader({
  onFilesSelected,
  multiple = true,
  className,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
      const newPreviews = arr.map((file) => ({ file, url: URL.createObjectURL(file) }))
      setPreviews((prev) => (multiple ? [...prev, ...newPreviews] : newPreviews))
      onFilesSelected(arr)
    },
    [multiple, onFilesSelected]
  )

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label
        className={cn(
          'relative flex flex-col items-center justify-center gap-2',
          'border-2 border-dashed rounded-[var(--radius)] p-6 cursor-pointer',
          'transition-colors duration-150',
          dragging
            ? 'border-brand-500 bg-brand-100'
            : 'border-ink-300 hover:border-brand-400 hover:bg-brand-100/30'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <input
          type="file"
          className="sr-only"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="p-3 bg-brand-100 rounded-full text-brand-600">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-ink-700">
            Glissez vos images ici ou <span className="text-brand-600">cliquez pour sélectionner</span>
          </p>
          <p className="text-xs text-ink-400 mt-0.5">PNG, JPG, WEBP — max 5 Mo par image</p>
        </div>
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          <AnimatePresence>
            {previews.map((p, i) => (
              <motion.div
                key={p.url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <img
                  src={p.url}
                  alt={p.file.name}
                  className="w-full h-full object-cover rounded-[10px] border border-ink-200"
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// Existing images display + delete
interface ExistingImagesProps {
  images: { id: number; thumbnail: string; medium: string }[]
  onDelete?: (id: number) => void
}

export function ExistingImages({ images, onDelete }: ExistingImagesProps) {
  if (!images.length) {
    return (
      <div className="flex items-center gap-2 text-ink-400 text-sm">
        <ImageIcon className="h-4 w-4" />
        <span>Aucune image</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {images.map((img) => (
        <div key={img.id} className="relative group aspect-square">
          <img
            src={img.thumbnail}
            alt=""
            className="w-full h-full object-cover rounded-[10px] border border-ink-200"
          />
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(img.id)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
