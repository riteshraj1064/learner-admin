"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { BookOpen, Clock, Users, Play, Lock, Target, Calendar, Globe, Phone, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axios from 'axios'

interface Test {
  _id: string
  title: string
  description: string
  duration: number
  testCategory: string
  isFree: boolean
  isLive?: boolean
  totalMarks: number
  passingMarks: number
  languages: string[]
  questions: string[]
  attempts: number
  status: string
  totalQuestions: number
  publishedAt: string
  availableFrom: string
  availableTo: string
  testSeries: string
}

interface TestSeries {
  _id: string
  title: string
  description: string
  image: string
  totalTests: number
  freeTests: number
  languages: string[]
  price?: string
  DiscountPrice?: string
  createdAt: string
}

interface ApiResponse {
  tests: Test[]
  isEnrolled: boolean
  testSeriesId: string
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGQzMDdjNDZhODQwYTU1NGJiNzA2YyIsImlhdCI6MTc0ODc3MjA4NCwiZXhwIjoxNzUxMzY0MDg0fQ.w-9MYlXSKP8FyH-QfUhv6Y8Hwg9EOT1IRs-dNHgVUuQ";

const headers = {
  Authorization: `Bearer ${token}`,
};

export default function TestSeriesDetailPage() {
  const params = useParams()
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [activeTab, setActiveTab] = useState("mock-tests")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [enrolledCount] = useState(2259400) // Mock data

  useEffect(() => {
    if (params.id) {
      fetchTestSeriesDetails()
    }
  }, [params.id])

  const fetchTestSeriesDetails = async () => {
    try {
      setLoading(true)
      // Mock API calls - replace with actual endpoints
      const [seriesResponse, testsResponse] = await Promise.all([
        axios.get(`http://13.235.79.13:5000/api/testseries/${params.id}`, { headers }),
        axios.get(`http://13.235.79.13:5000/api/tests/series/${params.id}`, { headers }),
      ]);

      // Mock data based on the provided response
      const mockTestSeries: TestSeries = {
        _id: params.id as string,
        title: "RRB NTPC Mock Test Series 2024-25 (CBT 1 + CBT 2)",
        description: "Comprehensive test series for RRB NTPC preparation",
        image: "https://res.cloudinary.com/diuizif1x/image/upload/v1745690678/categories/wepv4jyhexbuiuzl31ut.jpg",
        totalTests: 1799,
        freeTests: 17,
        languages: ["English", "Hindi"],
        price: "299",
        DiscountPrice: "199",
        createdAt: "2025-04-26T18:04:40.700Z",
      }

      // Use the provided test data
      const mockApiResponse: ApiResponse = {
        tests: [
          {
            _id: "681f9835afc49182bd2cb1d7",
            title: "free demo add",
            description: "demo free",
            duration: 10,
            testCategory: "Free Test",
            isFree: true,
            totalMarks: 15,
            passingMarks: 7,
            languages: ["Hindi", "English"],
            questions: ["681f9884afc49182bd2cb1f2"],
            attempts: 0,
            status: "not-started",
            totalQuestions: 15,
            publishedAt: "2025-05-10T18:16:43.804Z",
            availableFrom: "2025-05-10T18:16:10.248Z",
            availableTo: "2025-05-28T18:30:00.000Z",
            testSeries: params.id as string,
          },
          {
            _id: "681f2b942394901662620596",
            title: "demo subject",
            description: "",
            duration: 60,
            testCategory: "Subject Test",
            isFree: false,
            totalMarks: 100,
            passingMarks: 35,
            languages: ["Hindi", "English"],
            questions: ["681f2bbc23949016626205a8"],
            attempts: 0,
            status: "not-started",
            totalQuestions: 15,
            publishedAt: "2025-05-10T10:33:49.662Z",
            availableFrom: "2025-05-10T10:33:05.102Z",
            availableTo: "2025-05-26T18:30:00.000Z",
            testSeries: params.id as string,
          },
          {
            _id: "6813a9c9c258337fe78b9cd4",
            title: "demo live test 5",
            description: "",
            duration: 60,
            testCategory: "Full Test",
            isFree: false,
            isLive: true,
            totalMarks: 100,
            passingMarks: 35,
            languages: ["Hindi", "English"],
            questions: ["6814bc23c258337fe78b9d0c"],
            attempts: 0,
            status: "not-started",
            totalQuestions: 15,
            publishedAt: "2025-05-01T17:04:04.735Z",
            availableFrom: "2025-05-01T18:30:00.000Z",
            availableTo: "2025-05-01T18:30:00.000Z",
            testSeries: params.id as string,
          },
        ],
        isEnrolled: false,
        testSeriesId: params.id as string,
      }
      console.log(seriesResponse.data)
      setTestSeries(seriesResponse.data.testSeries)
      setTests(testsResponse.data.tests)
      setIsEnrolled(testsResponse.data.isEnrolled)
    } catch (error) {
      console.error("Error fetching test series details:", error)
    } finally {
      setLoading(false)
    }
  }
  const testCounts = {
  "Chapter Test": 1,
  "Free Test": 2,
  "Full Test": 0,
  "Section Test": 0,
  "Subject Test": 0,
}

  const handleEnrollment = async () => {
    try {
      // Mock enrollment
      setIsEnrolled(true)
    } catch (error) {
      console.error("Error enrolling:", error)
    }
  }

  const getTestCategoryColor = (category: string) => {
    switch (category) {
      case "Free Test":
        return "bg-green-100 text-green-800"
      case "Full Test":
        return "bg-blue-100 text-blue-800"
      case "Subject Test":
        return "bg-purple-100 text-purple-800"
      case "Chapter Test":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTestsByCategory = (category: string) => {
    if (category === "mock-tests") {
      return tests.filter((test) => !test.isLive)
    }
    return tests.filter((test) => test.isLive)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!testSeries) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Series Not Found</h2>
          <p className="text-gray-600 mb-4">The test series you're looking for doesn't exist.</p>
          <Link href="/test-series">
            <Button>Back to Test Series</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/test-series" className="hover:text-blue-600">
              Test Series
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{testSeries.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <Card className="overflow-hidden mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-xl">RRB</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{testSeries.title}</h1>
                    <p className="text-gray-600 mb-4">Last updated on Jun 1, 2025</p>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold">{testSeries.totalTests} Total Tests</span>
                      </div>
                      <Badge className="bg-green-500 text-white">{testSeries.freeTests} FREE TESTS</Badge>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <span>{(enrolledCount / 1000).toFixed(1)}k Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <span>English,Hindi</span>
                        <span className="text-blue-600 cursor-pointer">+6 More</span>
                      </div>
                    </div>

                    {/* Key Features */}
                    {/* <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">2 Ultimate Live Test</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">6 Most Repeated Railway</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">191 Most Saved Qs CT</span>
                      </div>
                    </div> */}

                    {/* Additional Stats */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {Object.entries(testCounts)
                        .filter(([, count]) => count > 0)
                        .map(([testType, count]) => (
                          <div key={testType}>
                            {count} {testType}
                          </div>
                        ))}
                    </div>

                  </div>
                </div>

                {!isEnrolled && (
                  <Button
                    className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white"
                    size="lg"
                    onClick={handleEnrollment}
                  >
                    Add This Test Series
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tests Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {testSeries.title} All Tests ({testSeries.totalTests})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="mock-tests" className="flex items-center gap-2">
                      Mock Tests
                    </TabsTrigger>
                    <TabsTrigger value="pyps" className="flex items-center gap-2">
                      PYPs <Badge variant="outline">PRO</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="mock-tests">
                    <div className="space-y-4">
                      {/* Category Filters */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <Button variant="outline" size="sm" className="bg-red-50 text-red-600 border-red-200">
                          Ultimate Live Test(2)
                        </Button>
                        <Button variant="outline" size="sm">
                          Most Repeated Railway 2024 PYQs(6)
                        </Button>
                        <Button variant="outline" size="sm">
                          Most Saved Qs CT(191)
                        </Button>
                      </div>

                      {/* Test List */}
                      <div className="space-y-3">
                        {getTestsByCategory("mock-tests").map((test, index) => (
                          <TestCard key={test._id} test={test} index={index} isEnrolled={isEnrolled} />
                        ))}
                      </div>

                      <div className="text-center mt-6">
                        <Button variant="outline" className="text-blue-600">
                          View More
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pyps">
                    <div className="text-center py-8 text-gray-500">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>PYPs are available for enrolled users only</p>
                      <Button className="mt-4" onClick={handleEnrollment}>
                        Enroll Now
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">Sign up To Test Your Exam Knowledge Now!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-gray-600 mb-4">Change Your Level Here</div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Enter your mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Signup & Take Free Tests</Button>

                <div className="text-center text-sm text-gray-600">
                  <span className="font-semibold">{(enrolledCount / 1000).toFixed(1)}k+</span> Enrolled this test series
                </div>
              </CardContent>
            </Card>

            {/* More Test Series */}
            <Card>
              <CardHeader>
                <CardTitle>More Testseries for you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <h4 className="font-medium text-sm">RRB ASM Psycho (Station Master) Mo...</h4>
                    <p className="text-xs text-gray-600">185 Total tests | 1 Free Tests</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <h4 className="font-medium text-sm">Reasoning for All Railway Exams...</h4>
                    <p className="text-xs text-gray-600">753 Total tests | 2 Free Tests</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <h4 className="font-medium text-sm">Mathematics for All Railway Exams...</h4>
                    <p className="text-xs text-gray-600">776 Total tests | 10 Free Tests</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <h4 className="font-medium text-sm">General Knowledge for All Railway Exams...</h4>
                    <p className="text-xs text-gray-600">1024 Total tests | 5 Free Tests</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Sign Up Now & Get Free Access to All</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>• Daily Live Classes</span>
                <span>• 3000+ Tests</span>
                <span>• Study Material & PDF</span>
                <span>• Quizzes With Detailed Analytics</span>
                <span>• +More Benefits</span>
              </div>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 text-white px-8">Get Free Access Now</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestCard({ test, index, isEnrolled }: { test: Test; index: number; isEnrolled: boolean }) {
  const isAvailable = new Date() >= new Date(test.availableFrom) && new Date() <= new Date(test.availableTo)
  const isLive = test.isLive

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">Test {index + 1}</span>
            <Badge className={getTestCategoryColor(test.testCategory)}>{test.testCategory}</Badge>
            {test.isFree && <Badge className="bg-green-500 text-white text-xs">FREE</Badge>}
            {isLive && <Badge className="bg-red-500 text-white text-xs">LIVE</Badge>}
          </div>

          <h3 className="font-semibold text-lg mb-1">{test.title}</h3>
          {test.description && <p className="text-gray-600 text-sm mb-3">{test.description}</p>}

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{test.duration} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{test.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{test.totalMarks} marks</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{test.attempts} attempts</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>
              Available: {new Date(test.availableFrom).toLocaleDateString()} -{" "}
              {new Date(test.availableTo).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {isEnrolled ? (
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600"
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable) {
                  window.location.href = `/test-series/${test.testSeries}/test/${test._id}/instructions`
                }
              }}
            >
              <Play className="h-4 w-4 mr-1" />
              {isAvailable ? "Start Test" : "Not Available"}
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={!test.isFree}>
              {test.isFree ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Try Free
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-1" />
                  Enroll
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function getTestCategoryColor(category: string) {
  switch (category) {
    case "Free Test":
      return "bg-green-100 text-green-800"
    case "Full Test":
      return "bg-blue-100 text-blue-800"
    case "Subject Test":
      return "bg-purple-100 text-purple-800"
    case "Chapter Test":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
