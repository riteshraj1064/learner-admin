"use client"

import type React from "react"

import { useState, useRef, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileSpreadsheet, Upload, X, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// API base URL
const API_BASE_URL = "http://13.203.232.106:5000/api"

export default function ImportQuestionsPage({ params }: { params: { id: string; testId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id, testId } = use(params)
  const token = localStorage.getItem('authToken')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if file is an Excel file
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls") &&
        !selectedFile.name.endsWith(".csv")
      ) {
        setError("Please upload a valid Excel file (.xlsx, .xls) or CSV file (.csv)")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      // Check if file is an Excel file
      if (
        !droppedFile.name.endsWith(".xlsx") &&
        !droppedFile.name.endsWith(".xls") &&
        !droppedFile.name.endsWith(".csv")
      ) {
        setError("Please upload a valid Excel file (.xlsx, .xls) or CSV file (.csv)")
        return
      }

      setFile(droppedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 300)

      // Send the file to the API
      const response = await fetch(`${API_BASE_URL}/questions/import/${testId}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
      console.log(response)
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to import questions")
      }

      const data = await response.json()

      toast({
        title: "Questions imported successfully",
        description: `${data.questions.length} questions have been added to the test.`,
      })

      // Redirect to the test details page
      setTimeout(() => {
        router.push(`/dashboard/tests/${id}/test/${testId}`)
      }, 1500)
    } catch (error) {
      console.error("Error importing questions:", error)
      setError(error instanceof Error ? error.message : "Failed to import questions. Please try again.")
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create a sample Excel template with headers
    const headers = ["questionText", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "marks"]
    const csvContent =
      headers.join(",") +
      "\n" +
      "What is the capital of India?,New Delhi,Mumbai,Kolkata,Chennai,New Delhi,1\n" +
      "Which planet is known as the Red Planet?,Earth,Mars,Jupiter,Venus,Mars,1"

    // Create a blob and download it
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "question_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/tests/${id}/test/${testId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Import Questions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Questions from Excel</CardTitle>
          <CardDescription>
            Upload an Excel file (.xlsx, .xls) or CSV file (.csv) containing questions to import into this test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center ${error ? "border-destructive" : "border-muted-foreground/25"
                }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB • {file.type || "Excel file"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove file
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Drag and drop your file here</h3>
                  <p className="mt-2 text-sm text-muted-foreground">or click the button below to browse your files</p>
                  <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                    Browse files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 text-sm font-medium">File Format Requirements</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Excel file (.xlsx, .xls) or CSV file (.csv)</li>
                <li>Required columns: questionText, optionA, optionB, optionC, optionD, correctAnswer, marks</li>
                <li>correctAnswer should match one of the options exactly</li>
                <li>marks should be a number</li>
              </ul>
              <Button variant="link" className="mt-2 h-auto p-0 text-sm" onClick={downloadTemplate}>
                <Download className="mr-1 h-3 w-3" />
                Download template
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tests/${id}/test/${testId}`}>Cancel</Link>
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Importing..." : "Import Questions"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
