"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Download, X, Package, FileText } from "lucide-react"
import { downloadMultipleFiles, getTotalSize, type DownloadableFile } from "@/lib/download-utils"
import { showToast } from "@/components/toast"

interface BulkDownloadModalProps {
  files: DownloadableFile[]
  isOpen: boolean
  onClose: () => void
}

export function BulkDownloadModal({ files, isOpen, onClose }: BulkDownloadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [zipName, setZipName] = useState("bytebox-files.zip")
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  const selectedFileObjects = files.filter((file) => selectedFiles.includes(file.id))
  const totalSize = getTotalSize(selectedFileObjects)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map((file) => file.id))
    } else {
      setSelectedFiles([])
    }
  }

  const handleFileSelect = (fileId: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, fileId])
    } else {
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId))
    }
  }

  const handleDownload = async () => {
    if (selectedFileObjects.length === 0) {
      showToast({
        type: "error",
        title: "No Files Selected",
        description: "Please select at least one file to download",
      })
      return
    }

    setDownloading(true)
    setProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      await downloadMultipleFiles(selectedFileObjects, zipName)

      clearInterval(progressInterval)
      setProgress(100)

      showToast({
        type: "success",
        title: "Download Complete",
        description: `Downloaded ${selectedFileObjects.length} files as ${zipName}`,
      })

      setTimeout(() => {
        onClose()
        setSelectedFiles([])
        setProgress(0)
      }, 1000)
    } catch (error) {
      showToast({
        type: "error",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download files",
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bulk Download
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* ZIP Name Input */}
          <div className="space-y-2">
            <label htmlFor="zip-name" className="text-sm font-medium">
              ZIP File Name
            </label>
            <Input
              id="zip-name"
              value={zipName}
              onChange={(e) => setZipName(e.target.value)}
              placeholder="Enter ZIP file name"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedFiles.length === files.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({files.length} files)
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length} selected • {totalSize}
              </span>
            )}
          </div>

          {/* File List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={`file-${file.id}`}
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={(checked) => handleFileSelect(file.id, checked as boolean)}
                />
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ))}
          </div>

          {/* Download Progress */}
          {downloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creating ZIP file...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={downloading}>
              Cancel
            </Button>
            <Button onClick={handleDownload} disabled={selectedFiles.length === 0 || downloading}>
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "Creating ZIP..." : `Download ${selectedFiles.length} Files`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
