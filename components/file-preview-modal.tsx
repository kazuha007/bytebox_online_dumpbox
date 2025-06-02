"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, FileIcon, HardDrive, Music, Sparkles } from "lucide-react"

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glass-effect border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
                {file.name}
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="glass-effect border-white/30 text-white hover:bg-white/20 hover-lift"
              >
                <a href={file.url} download={file.name}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImage && !imageError ? (
            <div className="flex justify-center p-4">
              <img
                src={file.url || "/placeholder.svg"}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg hover-lift"
                onError={() => setImageError(true)}
              />
            </div>
          ) : isPDF ? (
            <div className="w-full h-[70vh] p-4">
              <iframe src={file.url} className="w-full h-full border rounded-lg glass-effect" title={file.name} />
            </div>
          ) : isText ? (
            <div className="glass-effect p-6 rounded-lg m-4 border border-white/20">
              <p className="text-sm text-white/70 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Text file preview:
              </p>
              <iframe src={file.url} className="w-full h-96 border rounded glass-effect" title={file.name} />
            </div>
          ) : isVideo ? (
            <div className="w-full flex justify-center p-4">
              <video controls className="max-w-full max-h-[70vh] rounded-lg shadow-lg hover-lift" src={file.url}>
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isAudio ? (
            <div className="w-full p-8 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 pulse-glow float-animation">
                <Music className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-medium mb-6 text-white">{file.name}</p>
              <audio controls className="w-full max-w-md glass-effect rounded-lg">
                <source src={file.url} type={file.type} />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6 pulse-glow float-animation">
                <FileIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">Dump File</h3>
              <p className="text-white/70 mb-4">This file type cannot be previewed in the browser.</p>
              <div className="glass-effect p-4 rounded-lg mb-6 border border-white/20">
                <p className="text-sm text-white/70">
                  File type: {file.type || "Unknown"} | Extension: {fileExtension || "None"}
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 hover-lift"
              >
                <a href={file.url} download={file.name}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="border-t border-white/20 pt-4 mt-4 glass-effect p-4 rounded-lg">
          <div className="flex justify-between text-sm text-white/70">
            <span>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            <span>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
