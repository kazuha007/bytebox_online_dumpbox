"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, FileIcon, HardDrive, Music } from "lucide-react"

interface FilePreviewModalProps {
  file: {
    id: number
    name: string
    size: number
    type: string
    url: string
    uploadDate: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!file) return null

  const isImage = file.type.startsWith("image/")
  const isPDF = file.type === "application/pdf"
  const isText = file.type.startsWith("text/") || file.type.includes("json")
  const isVideo = file.type.startsWith("video/")
  const isAudio = file.type.startsWith("audio/")

  // Get file extension
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
                {file.name}
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={file.url} download={file.name}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImage && !imageError ? (
            <div className="flex justify-center">
              <img
                src={file.url || "/placeholder.svg"}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={() => setImageError(true)}
              />
            </div>
          ) : isPDF ? (
            <div className="w-full h-[70vh]">
              <iframe src={file.url} className="w-full h-full border rounded-lg" title={file.name} />
            </div>
          ) : isText ? (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Text file preview:</p>
              <iframe src={file.url} className="w-full h-96 border rounded bg-white" title={file.name} />
            </div>
          ) : isVideo ? (
            <div className="w-full flex justify-center">
              <video controls className="max-w-full max-h-[70vh] rounded-lg" src={file.url}>
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isAudio ? (
            <div className="w-full p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-4">{file.name}</p>
              <audio controls className="w-full max-w-md">
                <source src={file.url} type={file.type} />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Dump File</h3>
              <p className="text-muted-foreground mb-2">This file type cannot be previewed in the browser.</p>
              <p className="text-sm bg-muted p-2 rounded mb-4">
                File type: {file.type || "Unknown"} | Extension: {fileExtension || "None"}
              </p>
              <Button asChild>
                <a href={file.url} download={file.name}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            <span>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
