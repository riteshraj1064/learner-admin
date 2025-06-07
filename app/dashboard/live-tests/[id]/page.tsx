"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Plus, Trash2, Clock, Tag } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// API base URL
const API_BASE_URL = "http://13.235.79.13:5000/api"

interface Question {
  _id: string
  questionText: string
  options: string[]
  correctAnswer: string
  marks: number
}

interface AttemptedBy {
  user: {
    _id: string
    name: string
    email: string
  }
  startedAt: string
}

interface LiveTest {
  _id: string
  title: string
  description: string
  duration: number
  createdBy: {
    _id: string
    name?: string
  }
  isFree: boolean
  totalMarks: number
  passingMarks: number
  languages: string[]
  questions: Question[]
  attempts: number
  tags: string[]
  published: boolean
  publishedAt?: string
  availableFrom: string
  availableTo?: string
  attemptedBy: AttemptedBy[]
  createdAt: string
  updatedAt: string
}

export default function LiveTestDetailsPage({ params }: { params: { id: string } }) {
  const { id } = use(params)
  console.log(id)
  const router = useRouter()
  const token = localStorage.getItem('authToken')

  const { toast } = useToast()
  const [liveTest, setLiveTest] = useState<LiveTest | null>(null)
  const [questions, setQuestion] = useState<Question | null>(null)

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchLiveTest = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/live/live-test/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch live test")
        }
        const data = await response.json()
        setLiveTest(data)
        const qresponse = await fetch(`${API_BASE_URL}/questions/test/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch live test")
        }
        const qdata = await qresponse.json()
        const transformedQuestions: Question[] = qdata.map((q: any) => ({
          _id: q.id.toString(), // assuming 'id' is a number
          questionText: q.question,
          options: Object.values(q.options),
          correctAnswer: q.options[q.correctAnswer],
          marks: 1 // set default marks or pull from API if available
        }))

        setLiveTest((prev) => prev ? { ...prev, questions: transformedQuestions } : prev)
      } catch (error) {
        console.error("Error fetching live test:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load live test details",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLiveTest()
  }, [id, toast])


  const handleDeleteLiveTest = async () => {
    const testId = id
    if (!testId) return;

    try {
      setDeleting(true);

      const response = await fetch(`/live/live-test/6816f96630485a3996c44dca`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Make sure you have the token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete live test');
      }

      // Optionally trigger a refresh or update UI
      toast.success("Live test deleted successfully!");
      onClose(); // Close dialog if needed
      refetchTests(); // Or navigate/update list
    } catch (error) {
      console.error(error);
      toast.error("Error deleting live test.");
    } finally {
      setDeleting(false);
    }
  };


  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // This would typically be an API call to remove the question from the test
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete question")
      }

      // Update the local state to remove the question
      setLiveTest((prevTest) => {
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

  // Filter questions based on search term
  const filteredQuestions = (liveTest?.questions || []).filter(
    (question) =>
      question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.options.some((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/live-tests">
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

  if (!liveTest) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/live-tests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Live Test Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">The requested live test could not be found.</p>
            <Button asChild>
              <Link href="/dashboard/live-tests">Back to Live Tests</Link>
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
            <Link href="/dashboard/live-tests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{liveTest.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/live-tests/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
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
                  This action cannot be undone. This will permanently delete the live test and remove all associated
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLiveTest}
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
          <TabsTrigger value="attempts">Attempts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Live Test Details</CardTitle>
              <CardDescription>Comprehensive information about this live test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {liveTest.isFree && <Badge>Free</Badge>}
                    {liveTest.published ? (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        Draft
                      </Badge>
                    )}
                  </div>

                  {liveTest.description && <p className="text-muted-foreground">{liveTest.description}</p>}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{liveTest.duration} min</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Total Marks</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{liveTest.totalMarks}</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Passing Marks</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{liveTest.passingMarks}</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Attempts</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{liveTest.attempts}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {liveTest.languages?.map((language: string) => (
                        <Badge key={language} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {liveTest.tags && liveTest.tags.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {liveTest.tags.map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                          >
                            <Tag className="h-3 w-3" />
                            <span>{tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Availability</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Available From:</span>
                          <span className="text-sm font-medium">
                            {liveTest.availableFrom
                              ? new Date(liveTest.availableFrom).toLocaleDateString()
                              : "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Available To:</span>
                          <span className="text-sm font-medium">
                            {liveTest.availableTo
                              ? new Date(liveTest.availableTo).toLocaleDateString()
                              : "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium">Publishing</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className="text-sm font-medium">{liveTest.published ? "Published" : "Draft"}</span>
                        </div>
                        {liveTest.published && liveTest.publishedAt && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Published At:</span>
                            <span className="text-sm font-medium">
                              {new Date(liveTest.publishedAt).toLocaleDateString()}
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
                <CardDescription>Manage questions for this live test</CardDescription>
              </div>
              <Button className="mt-4 sm:mt-0" onClick={() => router.push(`/dashboard/live-tests/${id}/import-questions`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question

              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search questions..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {liveTest.questions && liveTest.questions.length > 0 ? (
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
                    {filteredQuestions.map((question) => (
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
                              <Link href={`/dashboard/live-tests/${id}/question/${question._id}`}>Edit</Link>
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
                  <p className="mb-4 text-muted-foreground">No questions have been added to this live test yet.</p>
                  <Button onClick={() => router.push(`/dashboard/live-tests/${id}/import-questions`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question

                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attempts">
          <Card>
            <CardHeader>
              <CardTitle>Test Attempts</CardTitle>
              <CardDescription>Users who have attempted this live test</CardDescription>
            </CardHeader>
            <CardContent>
              {liveTest.attemptedBy && liveTest.attemptedBy.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveTest.attemptedBy.map((attempt) => (
                      <TableRow key={attempt._id}>
                        <TableCell className="font-medium">{attempt.user}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{new Date(attempt.startedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/users/${attempt.user}`}>View User</Link>
                          </Button>
                        </TableCell>
                      </TableRow>

                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No users have attempted this live test yet.</p>
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
