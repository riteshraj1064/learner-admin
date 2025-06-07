"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// API base URL
const API_BASE_URL = "http://13.235.79.13:5000/api"

interface Category {
  _id: string
  title: string
}

// Available languages
const availableLanguages = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
]

export default function CreateTestSeriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    Category: "",
    totalTests: 0,
    freeTests: 0,
    Price:0,
    DiscountPrice:0
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await fetch(`${API_BASE_URL}/categories`)
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please try again.",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalTests" || name === "freeTests" || name === "Price" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }
  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((lang) => lang !== language))
    } else {
      setSelectedLanguages([...selectedLanguages, language])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem('authToken');
    e.preventDefault()

    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "Image required",
        description: "Please upload an image for the test series",
      })
      return
    }

    if (selectedLanguages.length === 0) {
      toast({
        variant: "destructive",
        title: "Languages required",
        description: "Please select at least one language",
      })
      return
    }

    if (!formData.Category) {
      toast({
        variant: "destructive",
        title: "Category required",
        description: "Please select a category for the test series",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("Category", formData.Category)
      formDataToSend.append("Price", formData.Price.toString())
      formDataToSend.append("DiscountPrice", formData.DiscountPrice.toString())
      formDataToSend.append("totalTests", formData.totalTests.toString())
      formDataToSend.append("freeTests", formData.freeTests.toString())
      formDataToSend.append("languages", JSON.stringify(selectedLanguages))
      formDataToSend.append("image", imageFile)


      const response = await fetch(`${API_BASE_URL}/testseries`, {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
console.log(response)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create test series")
      }

      toast({
        title: "Test Series created",
        description: "Test series has been created successfully",
      })

      router.push("/dashboard/tests")
    } catch (error) {
      console.error("Error creating test series:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test series. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/tests">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Test Series</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Test Series Information</CardTitle>
            <CardDescription>Create a new test series for your students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter test series title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Price">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Price"
                  name="Price"
                  placeholder="Enter test series title"
                  required
                  value={formData.Price}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="DiscountPrice">
                  DiscountPrice <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="DiscountPrice"
                  name="DiscountPrice"
                  placeholder="Enter test series title"
                  required
                  value={formData.DiscountPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                {loadingCategories ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select required onValueChange={(value) => setFormData((prev) => ({ ...prev, Category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalTests">Total Tests</Label>
                <Input
                  id="totalTests"
                  name="totalTests"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.totalTests}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeTests">Free Tests</Label>
                <Input
                  id="freeTests"
                  name="freeTests"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.freeTests}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter test series description"
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Languages <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((language) => (
                  <Button
                    key={language}
                    type="button"
                    variant={selectedLanguages.includes(language) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                Cover Image <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative h-32 w-48 overflow-hidden rounded-md border">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  required={!imagePreview}
                />
                {!imagePreview && (
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Browse
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/tests">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Test Series"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
