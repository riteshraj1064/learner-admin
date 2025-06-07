"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, FileText, Globe, Pencil, Trash2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

// API base URL
const API_BASE_URL = "http://13.235.79.13:5000/api"

interface Test {
  _id: string
  title: string
}

interface TestSeries {
  _id: string
  title: string
  description: string
  image: string
  createdBy: {
    _id: string
    name?: string
  }
  Category: {
    _id: string
    name: string
  }
  tests: Test[]
  enrolledUsers: Array<{ _id: string }>
  totalTests: number
  freeTests: number
  languages: string[]
  createdAt: string
  updatedAt: string
}

interface Tests {
  _id: string;
  title: string;
  description: string;
  duration: number;
  isFree: boolean;
  totalMarks: number;
  passingMarks: number;
  languages: string[];
  testCategory: string;
  testSeries: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  availableFrom: string;
  availableTo: string;
  createdAt: string;
  updatedAt: string;
  tests: Test[];
  isEnrolled: boolean;
  testSeriesId: string;
}

export default function TestSeriesDetailsPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const router = useRouter()
  const { toast } = useToast()
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null)
  const [tests, setTests] = useState<Tests[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchTestSeries = async () => {
      const token = localStorage.getItem('authToken')
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/testseries/${id}`,{
              headers: {
      Authorization: `Bearer ${token}`,
    },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch test series")
        }
        const data = await response.json()
        setTestSeries(data.testSeries)
      } catch (error) {
        console.error("Error fetching test series:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load test series details",
        })
      } finally {
        setLoading(false)
      }
    }
    const fetchTests = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch(`${API_BASE_URL}/tests/series/${id}`,{
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch test series")
        }
        const data = await response.json()
        setTests(data.tests)
        console.log(data)
      } catch (error) {
        console.error("Error fetching test series:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load test series details",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchTests()
    fetchTestSeries()
  }, [id, toast])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/testseries/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete test series")
      }

      toast({
        title: "Test Series deleted",
        description: "Test series has been deleted successfully",
      })

      router.push("/dashboard/tests")
    } catch (error) {
      console.error("Error deleting test series:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete test series",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/tests">
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
              <div className="flex flex-col gap-4 md:flex-row">
                <Skeleton className="h-48 w-full md:w-1/3" />
                <div className="flex w-full flex-col gap-4 md:w-2/3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!testSeries) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/tests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Test Series Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">The requested test series could not be found.</p>
            <Button asChild>
              <Link href="/dashboard/tests">Back to Test Series</Link>
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
            <Link href="/dashboard/tests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{testSeries.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tests/${id}/edit`}>
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
                  This action cannot be undone. This will permanently delete the test series and remove all associated
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
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
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="users">Enrolled Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Test Series Details</CardTitle>
              <CardDescription>Comprehensive information about this test series</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="md:w-1/3">
                    <img
                      src={testSeries.image || "/placeholder.svg"}
                      alt={testSeries.title}
                      className="h-48 w-full rounded-md object-cover"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="mb-2 text-lg font-medium">{testSeries.title}</h3>
                    <p className="text-muted-foreground">{testSeries.description}</p>

                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{testSeries.Category.name}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Created: {new Date(testSeries.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <FileText className="mb-2 h-8 w-8 text-primary" />
                        <p className="text-2xl font-bold">{testSeries.totalTests}</p>
                        <p className="text-sm text-muted-foreground">Total Tests</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <FileText className="mb-2 h-8 w-8 text-primary" />
                        <p className="text-2xl font-bold">{testSeries.freeTests}</p>
                        <p className="text-sm text-muted-foreground">Free Tests</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <User className="mb-2 h-8 w-8 text-primary" />
                        <p className="text-2xl font-bold">{testSeries.enrolledUsers?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Enrolled Users</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Globe className="mb-2 h-8 w-8 text-primary" />
                        <p className="text-2xl font-bold">{testSeries.languages?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Languages</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-medium">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {testSeries.languages?.map((language: string) => (
                      <Badge key={language} variant="secondary">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-medium">Created By</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                    <span>{testSeries.createdBy?.name || "Admin"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild>
                <Link href={`/dashboard/tests/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Test Series
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Tests</CardTitle>
              <CardDescription>All tests included in this test series</CardDescription>
            </CardHeader>
            <CardContent>
              {tests && tests.length > 0 ? (
                <div className="space-y-4">
                  {tests?.map((test: Test) => (
                    <Card key={test._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="font-medium">{test.title}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/tests/${id}/test/${test._id}`)}>
                            View Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-muted-foreground">No tests have been added to this test series yet.</p>
                  <Button>Add Test</Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => router.push(`/dashboard/tests/${id}/add-test`)}>
                <FileText className="mr-2 h-4 w-4" />
                Add New Test
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Users</CardTitle>
              <CardDescription>Users enrolled in this test series</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-muted-foreground">User enrollment details are not available in this view.</p>
                <Button asChild>
                  <Link href="/dashboard/users">View All Users</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
