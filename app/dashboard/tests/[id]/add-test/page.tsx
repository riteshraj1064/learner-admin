"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

// API base URL
const API_BASE_URL = "http://13.203.232.106:5000/api"

// Test categories from the schema
const TEST_CATEGORIES = ["Full Test", "Free Test", "Chapter Test", "Section Test", "Subject Test"]

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

interface TestSeries {
  _id: string
  title: string
  languages: string[]
}

export default function AddTestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = use(params);
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(new Date())
  const [availableTo, setAvailableTo] = useState<Date | undefined>(undefined)
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(undefined)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    testCategory: "",
    isFree: false,
    totalMarks: 100,
    passingMarks: 35,
    published: false,
    questions: [] as string[],
  })

  // Fetch test series data to get languages and other info
  useEffect(() => {
    const fetchTestSeries = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/testseries/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch test series")
        }
        const data = await response.json()
        setTestSeries(data)

        // Pre-select languages from the test series
        if (data.languages && data.languages.length > 0) {
          setSelectedLanguages(data.languages)
        }
      } catch (error) {
        console.error("Error fetching test series:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load test series data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTestSeries()
  }, [id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ["duration", "totalMarks", "passingMarks"].includes(name) ? Number(value) || 0 : value,
    }))
  }

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((lang) => lang !== language))
    } else {
      setSelectedLanguages([...selectedLanguages, language])
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('authToken');

    if (selectedLanguages.length === 0) {
      toast({
        variant: "destructive",
        title: "Languages required",
        description: "Please select at least one language",
      })
      return
    }

    if (!formData.testCategory) {
      toast({
        variant: "destructive",
        title: "Test category required",
        description: "Please select a test category",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const testData = {
        ...formData,
        languages: selectedLanguages,
        testSeries: id,
        tags,
        availableFrom: availableFrom?.toISOString(),
        availableTo: availableTo?.toISOString(),
        publishedAt: formData.published && publishedAt ? publishedAt.toISOString() : undefined,
      }
     console.log(testData)
      const response = await fetch(`${API_BASE_URL}/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(testData),
      })
    console.log(response)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create test")
      }

      toast({
        title: "Test created",
        description: "Test has been created successfully",
      })

      router.push(`/dashboard/tests/${id}`)
    } catch (error) {
      console.error("Error creating test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/tests/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/tests/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Test</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>Create a new test for {testSeries?.title || "this test series"}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter test title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testCategory">
                  Test Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.testCategory}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, testCategory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  placeholder="60"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isFree">Free Test</Label>
                  <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFree: checked }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Toggle to make this test available for free</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMarks">
                  Total Marks <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  min="1"
                  placeholder="100"
                  required
                  value={formData.totalMarks}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingMarks">
                  Passing Marks <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="passingMarks"
                  name="passingMarks"
                  type="number"
                  min="1"
                  placeholder="35"
                  required
                  value={formData.passingMarks}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter test description"
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Languages */}
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

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Available From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {availableFrom ? format(availableFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={availableFrom}
                      onSelect={setAvailableFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Available To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {availableTo ? format(availableTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={availableTo}
                      onSelect={setAvailableTo}
                      initialFocus
                      disabled={(date) => (availableFrom ? date < availableFrom : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Publishing */}
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Publish Test</h3>
                  <p className="text-xs text-muted-foreground">Make this test available to users</p>
                </div>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, published: checked }))
                    if (checked && !publishedAt) {
                      setPublishedAt(new Date())
                    }
                  }}
                />
              </div>

              {formData.published && (
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Clock className="mr-2 h-4 w-4" />
                        {publishedAt ? format(publishedAt, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={publishedAt} onSelect={setPublishedAt} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/dashboard/tests/${id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Test"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
