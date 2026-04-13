import { useCallback, useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function DropZone({ onFile, disabled = false }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const validate = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('JPG, PNG, PDF 파일만 업로드 가능합니다.')
      return false
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return false
    }
    setError(null)
    return true
  }

  const handleFile = useCallback(
    (file) => {
      if (!file || !validate(file)) return
      onFile(file)
    },
    [onFile],
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="파일 업로드 영역"
        className={[
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors',
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
          disabled ? 'pointer-events-none opacity-50' : '',
        ].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        <div className="mb-4 rounded-full bg-blue-50 p-4">
          <Upload className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-base font-medium text-gray-700">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="mt-1 text-sm text-gray-400">JPG, PNG, PDF · 최대 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
          <FileText className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
