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
const API_BASE_URL = "http://13.203.232.106:5000/api"

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
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        title: "",
    })



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "totalTests" || name === "freeTests" ? Number.parseInt(value) || 0 : value,
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


        setIsSubmitting(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append("title", formData.title)
            formDataToSend.append("image", imageFile)
            console.log(formDataToSend)
            const response = await fetch(`${API_BASE_URL}/categories`, {
                method: "POST",
                body: formDataToSend,
                headers: {
                    Authorization: `Bearer ${token}`
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to crete Category ")
            }

            toast({
                title: "Category created",
                description: "Category has been created successfully",
            })

            router.push("/dashboard/category")
        } catch (error) {
            console.error("Error creating test series:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create Category. Please try again.",
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
                <h1 className="text-2xl font-bold tracking-tight">Create Category</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Category Information</CardTitle>
                        <CardDescription>Create a new Category for your students.</CardDescription>
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
                                    placeholder="Enter category title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                />
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
