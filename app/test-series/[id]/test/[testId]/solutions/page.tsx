"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"

interface Question {
  id: number
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  correctAnswer: string
  userAnswer?: string | null
  explanation?: string
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGQzMDdjNDZhODQwYTU1NGJiNzA2YyIsImlhdCI6MTc0ODc3MjA4NCwiZXhwIjoxNzUxMzY0MDg0fQ.w-9MYlXSKP8FyH-QfUhv6Y8Hwg9EOT1IRs-dNHgVUuQ";

const headers = {
  Authorization: `Bearer ${token}`,
};
export default function TestSolutionsPage() {
  const params = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [testInfo, setTestInfo] = useState()
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all")

  useEffect(() => {
    fetchQuestions()
  }, [params.testId])

  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [filter, questions])
  const fetchQuestions = async () => {
    try {
      setLoading(true)

      try {
        const res = await axios.get(
          `http://172.20.10.3:5000/api/test-result/solution/${params.testId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        console.log(res.data)

        setQuestions(res.data.questions)
        setTestInfo(res.data.testInfo)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching latest test result:", error)
        setLoading(false)
        return null
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredQuestions = () => {
    switch (filter) {
      case "correct":
        return questions.filter((q) => q.userAnswer === q.correctAnswer)
      case "incorrect":
        return questions.filter((q) => q.userAnswer && q.userAnswer !== q.correctAnswer)
      case "skipped":
        return questions.filter((q) => q.userAnswer === null)
      default:
        return questions
    }
  }

  const filteredQuestions = getFilteredQuestions()

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
  }

  const getAnswerStatus = (question: Question) => {
    if (!question.userAnswer) return "skipped"
    return question.userAnswer === question.correctAnswer ? "correct" : "incorrect"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No questions found</h2>
          <p className="text-gray-600 mb-6">There are no questions matching your filter criteria.</p>
          <Button onClick={() => setFilter("all")}>Show All Questions</Button>
        </div>
      </div>
    )
  }


  const currentQuestion = filteredQuestions[currentQuestionIndex] || filteredQuestions[0]

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
              <span className="text-gray-600">{testInfo?.title}</span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/test-series/${params.id}/test/${params.testId}/results`)}
              >
                Back to Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Filter Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="all" value={filter} onValueChange={(value) => setFilter(value as any)}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="correct">Correct</TabsTrigger>
                <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
                <TabsTrigger value="skipped">Skipped</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow mb-6">
            {/* Question Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Question {currentQuestion?.id}</h2>
                <div className="flex items-center gap-2">
                  {currentQuestion && (
                    <>
                      {getAnswerStatus(currentQuestion) === "correct" && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Correct
                        </span>
                      )}
                      {getAnswerStatus(currentQuestion) === "incorrect" && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Incorrect
                        </span>
                      )}
                      {getAnswerStatus(currentQuestion) === "skipped" && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" /> Skipped
                        </span>

                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
              <div className="text-lg mb-6">{currentQuestion?.question}</div>

              {/* Options */}
              <div className="space-y-4 mb-8">
                {currentQuestion?.options && Object.entries(currentQuestion.options).map(([key, value]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border ${key === currentQuestion.correctAnswer
                      ? "bg-green-50 border-green-200"
                      : key === currentQuestion.userAnswer && key !== currentQuestion.correctAnswer
                        ? "bg-red-50 border-red-200"
                        : "border-gray-200"
                      }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${key === currentQuestion.correctAnswer
                          ? "bg-green-500 text-white"
                          : key === currentQuestion.userAnswer && key !== currentQuestion.correctAnswer
                            ? "bg-red-500 text-white"
                            : "bg-gray-200"
                          }`}
                      >
                        {key.toUpperCase()}
                      </div>
                      <div className="flex-1">{value}</div>
                      {key === currentQuestion.correctAnswer && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {key === currentQuestion.userAnswer && key !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}

              </div>

              {/* Explanation */}
              {currentQuestion?.explanation && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Explanation</h3>
                  <p className="text-blue-700">{currentQuestion?.explanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <div className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {filteredQuestions?.length}
            </div>
            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === filteredQuestions?.length - 1}
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
