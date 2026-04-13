import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, FileImage, Upload as UploadIcon } from 'lucide-react'
import DropZone from '../components/receipt/DropZone'
import { uploadReceipt } from '../api/receipts'
import { useToast } from '../store/ToastContext'

export default function Upload() {
  const navigate = useNavigate()
  const toast = useToast()

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | done
  const [progress, setProgress] = useState(0)

  const handleFile = (f) => {
    setFile(f)
    setStatus('idle')
    setProgress(0)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)

    // OCR 대기 중 진행바 시뮬레이션
    const timer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 4 : p))
    }, 400)

    try {
      const res = await uploadReceipt(file)
      clearInterval(timer)
      setProgress(100)
      setStatus('done')
      toast('영수증 분석이 완료되었습니다.', 'success')
      setTimeout(() => navigate(`/expenses/${res.data.id}`), 800)
    } catch (err) {
      clearInterval(timer)
      setStatus('idle')
      toast(err.message || '업로드에 실패했습니다.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <UploadIcon className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">영수증 업로드</h1>
      </div>

      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <DropZone onFile={handleFile} disabled={status === 'uploading' || status === 'done'} />

        {/* 선택된 파일 미리보기 */}
        {file && (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <FileImage className="h-8 w-8 shrink-0 text-blue-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {preview && (
              <img
                src={preview}
                alt="미리보기"
                className="mt-4 max-h-64 w-full rounded-lg object-contain"
              />
            )}
          </div>
        )}

        {/* 진행바 */}
        {status === 'uploading' && (
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-gray-500">
              <span>AI가 영수증을 분석 중입니다...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 완료 메시지 */}
        {status === 'done' && (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">분석 완료! 상세 화면으로 이동합니다.</span>
          </div>
        )}

        <button
          disabled={!file || status === 'uploading' || status === 'done'}
          onClick={handleUpload}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === 'uploading' ? '분석 중...' : 'AI 분석 시작'}
        </button>
      </div>
    </div>
  )
}
