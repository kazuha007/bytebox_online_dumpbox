import JSZip from "jszip"

export interface DownloadableFile {
  id: number
  name: string
  url: string
  size: number
}

/**
 * Download a single file
 */
export async function downloadSingleFile(file: DownloadableFile) {
  try {
    const response = await fetch(file.url)
    if (!response.ok) throw new Error("Download failed")

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Download error:", error)
    throw new Error(`Failed to download ${file.name}`)
  }
}

/**
 * Download multiple files as a ZIP archive
 */
export async function downloadMultipleFiles(files: DownloadableFile[], zipName = "bytebox-files.zip") {
  try {
    const zip = new JSZip()

    // Add each file to the ZIP
    for (const file of files) {
      try {
        const response = await fetch(file.url)
        if (!response.ok) {
          console.warn(`Failed to fetch ${file.name}, skipping...`)
          continue
        }

        const blob = await response.blob()
        zip.file(file.name, blob)
      } catch (error) {
        console.warn(`Error adding ${file.name} to ZIP:`, error)
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" })

    // Download ZIP
    const url = window.URL.createObjectURL(zipBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = zipName
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("ZIP download error:", error)
    throw new Error("Failed to create ZIP file")
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Get total size of multiple files
 */
export function getTotalSize(files: DownloadableFile[]): string {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  return formatFileSize(totalBytes)
}
