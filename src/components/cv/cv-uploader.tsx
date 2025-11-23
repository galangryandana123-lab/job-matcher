"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CVUploaderProps {
  onUploadComplete: (data: unknown) => void
  onError?: (error: string) => void
}

type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error'

export function CVUploader({ onUploadComplete, onError }: CVUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        onError?.("File size must be less than 5MB")
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }, [onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'parsing'
  })

  const handleUpload = async () => {
    if (!file) return

    setStatus('uploading')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setStatus('parsing')

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setStatus('success')
      onUploadComplete(data.data)
    } catch (err) {
      setStatus('error')
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }

  const removeFile = () => {
    setFile(null)
    setStatus('idle')
    setError(null)
  }

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          (status === 'uploading' || status === 'parsing') && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-600">CV Parsed Successfully!</p>
              <p className="mt-1 text-sm text-gray-500">Your profile has been updated</p>
            </div>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {status === 'idle' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {isDragActive ? "Drop your CV here" : "Upload your CV"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Drag & drop or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PDF or DOCX, max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {file && status !== 'success' && (
        <Button
          className="mt-4 w-full"
          onClick={handleUpload}
          disabled={status === 'uploading' || status === 'parsing'}
          isLoading={status === 'uploading' || status === 'parsing'}
        >
          {status === 'uploading' && "Uploading..."}
          {status === 'parsing' && "Analyzing CV with AI..."}
          {status === 'idle' && "Upload & Analyze CV"}
          {status === 'error' && "Try Again"}
        </Button>
      )}

      {(status === 'uploading' || status === 'parsing') && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {status === 'parsing' ? "AI is analyzing your CV..." : "Uploading..."}
        </div>
      )}
    </Card>
  )
}
