"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  BookOpen,
  FileText,
  Pencil,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// API base URL
const API_BASE_URL = "http://13.203.232.106:5000/api"

interface TestAnalytics {
  testId: {
    _id: string
    title: string
  }
  score: number
  timeTaken: number
  accuracy: number
  attemptedQuestions: number
  correctAnswers: number
  wrongAnswers: number
  dateAttempted: string
}

interface EnrolledSeries {
  seriesId: {
    _id: string
    title: string
    totalTests: number
  }
  enrolledAt: string
  completedTests: Array<{
    _id: string
    title: string
  }>
}

interface UserType {
  _id: string
  name: string
  email: string
  enrolledTestSeries: EnrolledSeries[]
  testAnalytics: TestAnalytics[]
  isVerified: boolean
  role: "admin" | "student" | "teacher"
  createdAt: string
  updatedAt: string
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const {id} = use(params)
  const token = localStorage.getItem('authToken')
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user/${id}`,{
          headers: {
            Authorization: `Bearer ${token}`
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch user")
        }
        const data = await response.json()
        console.log(data.users)
        setUser(data.users)
      } catch (error) {
        console.error("Error fetching user:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user details",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id, toast])

  // Format time from seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/users">
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
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex w-full flex-col gap-4">
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

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">User Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">The requested user could not be found.</p>
            <Button asChild>
              <Link href="/dashboard/users">Back to Users</Link>
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
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/users/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Basic information about the user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Badge
                variant={user.role === "admin" ? "default" : user.role === "teacher" ? "outline" : "secondary"}
                className="mt-2"
              >
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <div className="flex items-center gap-2">
                    {user.isVerified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="font-medium text-green-500">Verified</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <p className="font-medium text-red-500">Not Verified</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Role & Permissions</p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {user.role === "admin"
                      ? "Administrator (Full access to all features)"
                      : user.role === "teacher"
                        ? "Teacher (Can create and manage tests)"
                        : "Student (Can take tests and view results)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="enrolled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrolled">Enrolled Test Series</TabsTrigger>
          <TabsTrigger value="analytics">Test Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Test Series</CardTitle>
              <CardDescription>Test series the user is enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {user.enrolledTestSeries && user.enrolledTestSeries.length > 0 ? (
                <div className="space-y-4">
                  {user.enrolledTestSeries.map((series) => (
                    <Card key={series.seriesId._id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <h3 className="font-medium">{series.seriesId.title}</h3>
                            </div>
                            <Badge variant="outline">
                              Enrolled on {new Date(series.enrolledAt).toLocaleDateString()}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                Completed {series.completedTests.length} of {series.seriesId.totalTests} tests
                              </span>
                              <span>
                                {Math.round((series.completedTests.length / series.seriesId.totalTests) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(series.completedTests.length / series.seriesId.totalTests) * 100}
                              className="h-2"
                            />
                          </div>

                          {series.completedTests.length > 0 && (
                            <div className="mt-2">
                              <p className="mb-2 text-sm font-medium">Completed Tests:</p>
                              <div className="flex flex-wrap gap-2">
                                {series.completedTests.map((test) => (
                                  <Badge key={test._id} variant="secondary">
                                    {test.title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">This user is not enrolled in any test series.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Test Analytics</CardTitle>
              <CardDescription>Performance analytics for tests taken by the user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.testAnalytics && user.testAnalytics.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <BarChart3 className="mb-2 h-8 w-8 text-primary" />
                          <p className="text-2xl font-bold">
                            {Math.round(
                              user.testAnalytics.reduce((acc, curr) => acc + curr.accuracy, 0) /
                                user.testAnalytics.length,
                            )}
                            %
                          </p>
                          <p className="text-sm text-muted-foreground">Average Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <FileText className="mb-2 h-8 w-8 text-primary" />
                          <p className="text-2xl font-bold">{user.testAnalytics.length}</p>
                          <p className="text-sm text-muted-foreground">Tests Attempted</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <Clock className="mb-2 h-8 w-8 text-primary" />
                          <p className="text-2xl font-bold">
                            {formatTime(
                              Math.round(
                                user.testAnalytics.reduce((acc, curr) => acc + curr.timeTaken, 0) /
                                  user.testAnalytics.length,
                              ),
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">Average Time per Test</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Time Taken</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.testAnalytics.map((analytics) => (
                        <TableRow key={analytics.testId._id}>
                          <TableCell className="font-medium">{analytics.testId.title}</TableCell>
                          <TableCell>{analytics.score}</TableCell>
                          <TableCell>{analytics.accuracy}%</TableCell>
                          <TableCell>
                            {analytics.correctAnswers}/{analytics.attemptedQuestions}
                          </TableCell>
                          <TableCell>{formatTime(analytics.timeTaken)}</TableCell>
                          <TableCell>{new Date(analytics.dateAttempted).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">This user has not attempted any tests yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
