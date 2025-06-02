"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Search,
  Grid,
  List,
  Download,
  Trash2,
  File,
  ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  MoreVertical,
  User,
  LogOut,
  Moon,
  Sun,
  AlertCircle,
  HardDrive,
  Home,
  Sparkles,
  Cloud,
  Zap,
  Lock,
} from "lucide-react"
import { downloadSingleFile } from "@/lib/download-utils"
import { BulkDownloadModal } from "@/components/bulk-download-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FilePreviewModal } from "@/components/file-preview-modal"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ToastContainer, showToast } from "@/components/toast"
import { ChangePasswordModal } from "@/components/change-password-modal"

interface FileItem {
  id: number
  name: string
  size: number
  type: string
  url: string
  uploadDate: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />
  if (type.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />
  if (type.startsWith("audio/")) return <Music className="w-5 h-5 text-green-500" />
  if (type.includes("pdf") || type.includes("document") || type.includes("text"))
    return <FileText className="w-5 h-5 text-orange-500" />
  if (type.includes("zip") || type.includes("archive")) return <Archive className="w-5 h-5 text-yellow-500" />
  return <File className="w-5 h-5 text-gray-500" />
}

// File size limit: 100MB (increased for dump files)
const MAX_FILE_SIZE = 100 * 1024 * 1024

export default function Dashboard() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadError, setUploadError] = useState("")
  const router = useRouter()

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false)
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/files")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        if (response.ok) {
          const data = await response.json()
          setFiles(data.files)
        }

        // Get user info
        const userResponse = await fetch("/api/auth/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/landing")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const validateFiles = (filesToValidate: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []

    filesToValidate.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} is too large (max 100MB)`)
      } else if (file.size === 0) {
        errors.push(`${file.name} is empty`)
      } else {
        valid.push(file)
      }
    })

    return { valid, errors }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return

    setUploadError("")
    const { valid, errors } = validateFiles(filesToUpload)

    if (errors.length > 0) {
      setUploadError(errors.join(", "))
      errors.forEach((error) => {
        showToast({
          type: "error",
          title: "File Validation Error",
          description: error,
        })
      })
    }

    if (valid.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < valid.length; i++) {
        const file = valid[i]
        console.log(`📤 Uploading file ${i + 1}/${valid.length}:`, file.name)

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setFiles((prev) => [data.file, ...prev])
          showToast({
            type: "success",
            title: "File Uploaded",
            description: `${data.file.name} uploaded successfully`,
          })
        } else {
          const errorData = await response.json()
          console.error("Upload failed:", errorData)
          showToast({
            type: "error",
            title: "Upload Failed",
            description: `${file.name}: ${errorData.error || "Please try again"}`,
          })
        }

        setUploadProgress(((i + 1) / valid.length) * 100)
      }
    } catch (error) {
      console.error("Upload error:", error)
      showToast({
        type: "error",
        title: "Upload Failed",
        description: "Network error. Please try again.",
      })
    } finally {
      setUploading(false)
      setUploadModalOpen(false)
      setUploadProgress(0)
      setUploadError("")
    }
  }

  const handleFileDelete = async (fileId: number) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles(files.filter((file) => file.id !== fileId))
        showToast({
          type: "success",
          title: "File Deleted",
          description: "File removed from your storage",
        })
      } else {
        showToast({
          type: "error",
          title: "Delete Failed",
          description: "Could not delete the file",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Delete Failed",
        description: "Could not delete the file",
      })
    }
  }

  const handleFilePreview = (file: FileItem) => {
    setPreviewFile(file)
    setPreviewModalOpen(true)
  }

  const handleFileDownload = async (file: FileItem) => {
    try {
      await downloadSingleFile(file)
      showToast({
        type: "success",
        title: "Download Started",
        description: `${file.name} is being downloaded`,
      })
    } catch (error) {
      showToast({
        type: "error",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not download the file",
      })
    }
  }

  const totalStorage = 15 // GB
  const usedStorage = files.reduce((total, file) => total + file.size, 0) / (1024 * 1024 * 1024) // Convert to GB
  const storagePercentage = (usedStorage / totalStorage) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
            <LoadingSpinner size="lg" />
          </div>
          <p className="mt-4 text-muted-foreground font-medium">Loading your dumpyard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""} bg-background`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-8 float-animation">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow">
              <Archive className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">ByteBox</h1>
          </div>

          {/* Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="w-full justify-start mb-2 hover-lift"
              onClick={() => router.push("/landing")}
            >
              <Home className="w-4 h-4 mr-2 icon-bounce" />
              Home
            </Button>
          </div>

          {/* Upload Button */}
          <Button className="mb-6 w-full hover-lift pulse-glow" size="lg" onClick={() => setUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2 icon-bounce" />
            Upload Dump Files
          </Button>

          {/* Storage Stats */}
          <Card className="mb-6 hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Storage
                </span>
                <span className="text-xs text-muted-foreground">
                  {usedStorage.toFixed(2)} GB of {totalStorage} GB
                </span>
              </div>
              <Progress value={storagePercentage} className="h-2" />
            </CardContent>
          </Card>

          {/* User Section */}
          <div className="mt-auto">
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">ByteMail</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChangePasswordModalOpen(true)}>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="float-animation">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Your Secret Dumpyard
                  </h2>
                  <p className="text-muted-foreground">Manage your dumped files securely</p>
                </div>
                <div className="relative flex-1 max-w-md ml-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {filteredFiles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkDownloadModalOpen(true)}
                    className="hover-lift"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Bulk Download
                  </Button>
                )}
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            className={`flex-1 p-6 ${dragActive ? "bg-muted/50" : ""} transition-all duration-300`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {dragActive && (
              <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center z-50">
                <div className="text-center float-animation">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-xl font-medium">Drop any files here to upload</p>
                </div>
              </div>
            )}

            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 pulse-glow float-animation">
                  <HardDrive className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No dump files yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {searchQuery
                    ? "No files match your search."
                    : "Upload any files to get started with your secret dumpyard."}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setUploadModalOpen(true)} className="hover-lift">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Dump Files
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-3"
                }
              >
                {filteredFiles.map((file, index) => (
                  <Card
                    key={file.id}
                    className={`${viewMode === "list" ? "p-4" : "p-3"} hover-lift transition-all duration-300 float-animation`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className={`${viewMode === "list" ? "flex items-center gap-4 p-0" : "p-0"}`}>
                      {viewMode === "list" ? (
                        <>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="icon-bounce">{getFileIcon(file.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleFilePreview(file)}
                              >
                                {file.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleFileDownload(file)}
                              className="hover:text-green-600 icon-bounce"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleFileDelete(file.id)}
                              className="hover:text-red-600 icon-bounce"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <div
                            className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-all icon-bounce"
                            onClick={() => handleFilePreview(file)}
                          >
                            {getFileIcon(file.type)}
                          </div>
                          <p className="font-medium text-sm truncate mb-1">{file.name}</p>
                          <p className="text-xs text-muted-foreground mb-3">{formatFileSize(file.size)}</p>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-green-600"
                              onClick={() => handleFileDownload(file)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-red-600"
                              onClick={() => handleFileDelete(file.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Upload Dump Files
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover-lift">
              <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground icon-bounce" />
              <p className="text-lg font-medium mb-2">Dump any files here</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop any files here, or click to select (max 100MB per file)
              </p>
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(Array.from(e.target.files))
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Zap className="w-4 h-4 mr-2" />
                  Select Files
                </label>
              </Button>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uploading...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false)
          setPreviewFile(null)
        }}
      />
      {/* Bulk Download Modal */}
      <BulkDownloadModal
        files={filteredFiles}
        isOpen={bulkDownloadModalOpen}
        onClose={() => setBulkDownloadModalOpen(false)}
      />
      {/* Toast Container */}
      <ToastContainer />
      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={changePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
    </div>
  )
}
