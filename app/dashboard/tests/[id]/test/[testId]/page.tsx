"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Edit, FileSpreadsheet, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// API base URL
const API_BASE_URL = "http://13.203.232.106:5000/api"

interface Question {
  _id: string
  questionText: string
  options: string[]
  correctAnswer: string
  marks: number
}

interface Test {
  _id: string
  title: string
  description?: string
  duration: number
  testCategory: string
  isFree: boolean
  totalMarks: number
  passingMarks: number
  languages: string[]
  questions: Question[]
  published: boolean
  publishedAt?: string
  availableFrom?: string
  availableTo?: string
  createdAt: string
  attempts: number
}

export default function TestDetailsPage({ params }: { params: { id: string; testId: string } }) {
  const { id, testId } = use(params)
  const token = localStorage.getItem('authToken');

  const router = useRouter()
  const { toast } = useToast()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/tests/${testId}`,{
          headers: {
            Authorization: `Bearer ${token}`
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch test")
        }
        const data = await response.json()
        setTest(data)
      } catch (error) {
        console.error("Error fetching test:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load test details",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId, toast])

  const handleDeleteTest = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete test")
      }

      toast({
        title: "Test deleted",
        description: "Test has been deleted successfully",
      })

      router.push(`/dashboard/tests/${id}`)
    } catch (error) {
      console.error("Error deleting test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete test",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // This would typically be an API call to remove the question from the test
      // For now, we'll just simulate it by updating the state
      setTest((prevTest) => {
        if (!prevTest) return null
        return {
          ...prevTest,
          questions: prevTest.questions.filter((q) => q._id !== questionId),
        }
      })

      toast({
        title: "Question removed",
        description: "Question has been removed from the test",
      })

      setQuestionToDelete(null)
    } catch (error) {
      console.error("Error removing question:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove question",
      })
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
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/tests/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Test Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">The requested test could not be found.</p>
            <Button asChild>
              <Link href={`/dashboard/tests/${id}`}>Back to Test Series</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/tests/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{test.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tests/${id}/test/${testId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the test and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTest}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>Comprehensive information about this test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={test.testCategory === "Free Test" ? "default" : "outline"}>
                      {test.testCategory}
                    </Badge>
                    {test.isFree && <Badge>Free</Badge>}
                    {test.published ? (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        Draft
                      </Badge>
                    )}
                  </div>

                  {test.description && <p className="text-muted-foreground">{test.description}</p>}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{test.duration} min</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Total Marks</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{test.totalMarks}</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Passing Marks</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{test.passingMarks}</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Attempts</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{test.attempts}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {test.languages?.map((language: string) => (
                        <Badge key={language} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Availability</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Available From:</span>
                          <span className="text-sm font-medium">
                            {test.availableFrom ? new Date(test.availableFrom).toLocaleDateString() : "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Available To:</span>
                          <span className="text-sm font-medium">
                            {test.availableTo ? new Date(test.availableTo).toLocaleDateString() : "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium">Publishing</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className="text-sm font-medium">{test.published ? "Published" : "Draft"}</span>
                        </div>
                        {test.published && test.publishedAt && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Published At:</span>
                            <span className="text-sm font-medium">
                              {new Date(test.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Manage questions for this test</CardDescription>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/tests/${id}/test/${testId}/import-questions`}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Import from Excel
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/dashboard/tests/${id}/test/${testId}/add-question`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {test.questions && test.questions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead>Correct Answer</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {test.questions.map((question) => (
                      <TableRow key={question._id}>
                        <TableCell className="font-medium">{question.questionText}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {question.options.map((option, index) => (
                              <div key={index} className="text-sm">
                                {String.fromCharCode(65 + index)}. {option}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{question.correctAnswer}</TableCell>
                        <TableCell>{question.marks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/tests/${id}/test/${testId}/question/${question._id}`}
                              >
                                Edit
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => setQuestionToDelete(question._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-muted-foreground">No questions have been added to this test yet.</p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/tests/${id}/test/${testId}/import-questions`}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Import from Excel
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/dashboard/tests/${id}/test/${testId}/add-question`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Question Confirmation Dialog */}
      <AlertDialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => questionToDelete && handleDeleteQuestion(questionToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
