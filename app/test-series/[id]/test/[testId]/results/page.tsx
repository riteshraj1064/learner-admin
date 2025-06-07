"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Star, Trophy, CheckCircle, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"

interface TestResult {
  rank: number
  totalRanked: number
  score: number
  totalMarks: number
  attempted: number
  totalQuestions: number
  accuracy: number
  percentile: number
  timeTaken: string
  totalTime: string
  correctAnswers: number
  incorrectAnswers: number
  skippedAnswers: number
  negativeMarks: number
  sectionalSummary: {
    name: string
    score: number
    totalMarks: number
    attempted: number
    totalQuestions: number
    accuracy: number
    timeTaken: string
    totalTime: string
  }[]
  weakChapters: {
    id: number
    name: string
    score: number
    accuracy: number
    speed: number
  }[]
  topRankers: {
    rank: number
    name: string
    score: number
    totalMarks: number
  }[]
  questionDistribution: {
    correct: number
    incorrect: number
    partiallyCorrect: number
    skipped: number
  }
  userAnswers?: Record<string, any>
  questions?: any[]
  testInfo?: {
    title: string
  }
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGQzMDdjNDZhODQwYTU1NGJiNzA2YyIsImlhdCI6MTc0ODc3MjA4NCwiZXhwIjoxNzUxMzY0MDg0fQ.w-9MYlXSKP8FyH-QfUhv6Y8Hwg9EOT1IRs-dNHgVUuQ";

const headers = {
  Authorization: `Bearer ${token}`,
};
export default function TestResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // In a real app, fetch the results from an API
    fetchLatestTestResult()
  }, [params.testId, searchParams])

  const fetchLatestTestResult = async ( ) => {
  try {
    const res = await axios.get(
      `http://172.20.10.3:5000/api/test-result/latest/${params.testId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log(res.data)
    setResult(res.data)
    setLoading(false)
  } catch (error) {
    console.error("Error fetching latest test result:", error)
    setLoading(false)
    return null
  }
}



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Results Not Found</h2>
          <p className="text-gray-600">The test results you're looking for don't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-blue-500 font-bold text-xl">testbook</span>
              </div>
              <span className="text-gray-600">{result?.testInfo?.title}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Rate the Test</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-gray-300 hover:text-yellow-400 cursor-pointer"
                      fill="transparent"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => router.push(`/test-series/${params.id}`)}
                >
                  Go to Tests
                </Button>
                <span className="text-gray-400">or</span>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                  onClick={() => router.push(`/test-series/${params.id}/test/${params.testId}/solutions`)}
                >
                  Solutions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Reattempt Banner */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Reattempt Test with <span className="font-bold">testbook</span>{" "}
                  <span className="bg-gray-800 text-white text-xs px-1 py-0.5 rounded">PRO</span>
                </h3>
                <p className="text-sm text-gray-600">Learn from past mistakes & improve</p>
              </div>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600">Reattempt Test</Button>
          </div>
        </div>

        {/* Overall Performance Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Performance Summary</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Rank */}
              <div className="flex items-center gap-4">
                <div className="bg-red-500 rounded-full p-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {result.rank} <span className="text-gray-400 text-sm font-normal">/ {result.totalRanked}</span>
                  </div>
                  <div className="text-sm text-gray-500">Rank</div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4">
                <div className="bg-purple-500 rounded-full p-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {result.score} <span className="text-gray-400 text-sm font-normal">/ {result.totalMarks}</span>
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>

              {/* Attempted */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {result.attempted}{" "}
                    <span className="text-gray-400 text-sm font-normal">/ {result.totalQuestions}</span>
                  </div>
                  <div className="text-sm text-gray-500">Attempted</div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="flex items-center gap-4">
                <div className="bg-green-500 rounded-full p-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">{result.accuracy}%</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
              </div>

              {/* Percentile */}
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500 rounded-full p-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">{result.percentile}%</div>
                  <div className="text-sm text-gray-500">Percentile</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sectional Summary */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Sectional Summary</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Estimated cutoffs :</span>
              <Select defaultValue="category">
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Select your category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Select your category</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="st">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.sectionalSummary.map((section, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{section.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {section.score} <span className="text-xs text-gray-400">/ {section.totalMarks}</span>
                      </div>
                    
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.attempted} <span className="text-xs text-gray-400">/ {section.totalQuestions}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{section.accuracy}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.timeTaken} <span className="text-xs text-gray-400">/ {section.totalTime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your Weakness and Strengths */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Weakness and Strengths</h2>
            <div className="bg-white rounded-lg shadow">
              <Tabs defaultValue="weak">
                <TabsList className="w-full border-b">
                  <TabsTrigger value="weak" className="flex-1 py-3">
                    Weak Chapters
                  </TabsTrigger>
                  <TabsTrigger value="uncategorized" className="flex-1 py-3">
                    Uncategorized Chapters
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="weak" className="p-4">
                  {result.weakChapters.map((chapter) => (
                    <div key={chapter.id} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {chapter.id}. {chapter.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                          {chapter.score}
                        </div>
                        <div className="bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                          {chapter.accuracy}
                        </div>
                        <div className="bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                          {chapter.speed}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="uncategorized" className="p-4">
                  <p className="text-gray-500 text-sm">No uncategorized chapters found.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Top Rankers */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Rankers</h2>
            <div className="bg-white rounded-lg shadow p-4">
              {result.topRankers.map((ranker, index) => (
                <div key={index} className="flex items-center gap-4 mb-4 last:mb-0">
                  <div className="font-bold text-gray-700">{ranker.rank}.</div>
                  <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white">
                    {ranker.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{ranker.name}</div>
                    <div className="text-sm text-gray-500">
                      {ranker.score}/{ranker.totalMarks}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Marks Distribution */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Marks Distribution</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 w-full">
              {/* This would be a chart in a real implementation */}
              <div className="h-full w-full flex items-center justify-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/res1.PNG-ZK31TWbG9mXbO3gUeE6wPUT3gEmlaN.png"
                  alt="Marks Distribution Chart"
                  className="max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Distribution */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Question Distribution</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 w-full">
              {/* This would be a chart in a real implementation */}
              <div className="h-full w-full flex items-center justify-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/res2.PNG-HKgS6O2ZhH0bWBp9rYyZ3aIpII4DLY.png"
                  alt="Question Distribution Chart"
                  className="max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
