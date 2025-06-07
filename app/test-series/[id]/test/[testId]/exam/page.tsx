"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { User, Maximize, Pause, Flag, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
}

interface TestData {
  _id: string
  title: string
  duration: number
  totalMarks: number
  questions: Question[]
  languages: string[]
}

interface Answer {
  questionId: string
  selectedOption: string | null
  isMarked: boolean
  timeSpent: number
}
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGQzMDdjNDZhODQwYTU1NGJiNzA2YyIsImlhdCI6MTc0ODc3MjA4NCwiZXhwIjoxNzUxMzY0MDg0fQ.w-9MYlXSKP8FyH-QfUhv6Y8Hwg9EOT1IRs-dNHgVUuQ";

const headers = {
  Authorization: `Bearer ${token}`,
};

type QuestionStatus = "not-visited" | "not-answered" | "answered" | "marked" | "marked-answered"

export default function TestExamPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedLanguage = searchParams.get("lang") || "English"

  const [test, setTest] = useState<TestData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]))
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  // Mock test data
  const mockQuestions: Question[] = [
    {
      id: 1,
      question:
        "एक श्रृंखला दी गई है, जिसमें एक पद लुप्त है। दिए गए विकल्पों में से वह सही विकल्प चुनिए, जो श्रृंखला को पूरा करेगा।\n\n4D23, 9H19, 16Q10, 25G20, ?",
      options: { a: "36U21", b: "45J17", c: "49K16", d: "36F21" },
      correctAnswer: "a",
    },
    {
      id: 2,
      question: "निम्नलिखित में से कौन सा विकल्प सही है?",
      options: { a: "विकल्प A", b: "विकल्प B", c: "विकल्प C", d: "विकल्प D" },
      correctAnswer: "b",
    },
    // Add more mock questions as needed
  ]

  useEffect(() => {
    fetchTestData()
  }, [params.testId])

  useEffect(() => {
    if (test && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [test, isPaused, answers, startTime])

  useEffect(() => {
    setStartTime(Date.now())
    setQuestionStartTime(Date.now())
  }, [])

  const fetchTestData = async () => {
    try {
      setLoading(true)

      // Fetch test details
      const testResponse = await fetch(`http://13.235.79.13:5000/api/tests/${params.testId}`, { headers })
      if (!testResponse.ok) throw new Error("Failed to fetch test details")
      const testData = await testResponse.json()

      // Fetch questions for the test
      const response = await fetch(`http://172.20.10.3:5000/api/questions/test/${params.testId}`, {
        method: "POST",
        headers: {
          ...headers, // assumes headers already include Authorization
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const questionsData = await response.json();

      const testWithQuestions: TestData = {
        _id: testData._id,
        title: testData.title,
        duration: testData.duration,
        totalMarks: testData.questionCount,
        questions: questionsData,
        languages: testData.languages || ["English", "Hindi"],
      }

      setTest(testWithQuestions)
      setTimeLeft(testWithQuestions.duration * 60)

      // Initialize answers
      const initialAnswers: Record<string, Answer> = {}
      questionsData.forEach((q: Question) => {
        initialAnswers[q.id.toString()] = {
          questionId: q.id.toString(),
          selectedOption: null,
          isMarked: false,
          timeSpent: 0,
        }
      })
      setAnswers(initialAnswers)
    } catch (error) {
      console.error("Error fetching test data:", error)
      // Fallback to mock data for development
      const mockTest: TestData = {
        _id: params.testId as string,
        title: "RRB NTPC Graduate Level Full Test - 01",
        duration: 90,
        totalMarks: 100,
        questions: mockQuestions,
        languages: ["English", "Hindi"],
      }
      setTest(mockTest)
      setTimeLeft(mockTest.duration * 60)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getQuestionStatus = (questionIndex: number): QuestionStatus => {
    if (!test) return "not-visited"

    const question = test.questions[questionIndex]
    const answer = answers[question.id.toString()]

    if (!visitedQuestions.has(questionIndex)) return "not-visited"
    if (answer?.isMarked && answer?.selectedOption !== null) return "marked-answered"
    if (answer?.isMarked) return "marked"
    if (answer?.selectedOption !== null) return "answered"
    return "not-answered"
  }

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case "answered":
        return "bg-green-500 text-white"
      case "marked":
        return "bg-purple-500 text-white"
      case "marked-answered":
        return "bg-purple-500 text-white"
      case "not-answered":
        return "bg-red-500 text-white"
      case "not-visited":
        return "bg-gray-200 text-gray-700"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  const getStatusCounts = () => {
    if (!test) return { answered: 0, marked: 0, notVisited: 0, notAnswered: 0, markedAnswered: 0 }

    let answered = 0,
      marked = 0,
      notVisited = 0,
      notAnswered = 0,
      markedAnswered = 0

    test.questions.forEach((_, index) => {
      const status = getQuestionStatus(index)
      switch (status) {
        case "answered":
          answered++
          break
        case "marked":
          marked++
          break
        case "marked-answered":
          markedAnswered++
          break
        case "not-answered":
          notAnswered++
          break
        case "not-visited":
          notVisited++
          break
      }
    })

    return { answered, marked, notVisited, notAnswered, markedAnswered }
  }

  const handleQuestionSelect = (questionIndex: number) => {
    // Update time spent on current question
    if (test) {
      const currentQuestion = test.questions[currentQuestionIndex]
      const timeSpentOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000)
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id.toString()]: {
          ...prev[currentQuestion.id.toString()],
          timeSpent: (prev[currentQuestion.id.toString()]?.timeSpent || 0) + timeSpentOnQuestion,
        },
      }))
    }

    setCurrentQuestionIndex(questionIndex)
    setVisitedQuestions((prev) => new Set([...prev, questionIndex]))
    setQuestionStartTime(Date.now())
  }

  const handleAnswerSelect = (optionKey: string) => {
    if (!test) return

    const currentQuestion = test.questions[currentQuestionIndex]
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id.toString()]: {
        ...prev[currentQuestion.id.toString()],
        selectedOption: optionKey,
      },
    }))
  }

  const handleMarkForReview = () => {
    if (!test) return

    const currentQuestion = test.questions[currentQuestionIndex]
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id.toString()]: {
        ...prev[currentQuestion.id.toString()],
        isMarked: !prev[currentQuestion.id.toString()]?.isMarked,
      },
    }))

    // Move to next question
    if (currentQuestionIndex < test.questions.length - 1) {
      handleQuestionSelect(currentQuestionIndex + 1)
    }
  }

  const handleClearResponse = () => {
    if (!test) return

    const currentQuestion = test.questions[currentQuestionIndex]
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id.toString()]: {
        ...prev[currentQuestion.id.toString()],
        selectedOption: null,
      },
    }))
  }

  const handleSaveAndNext = () => {
    if (!test) return

    if (currentQuestionIndex < test.questions.length - 1) {
      handleQuestionSelect(currentQuestionIndex + 1)
    }
  }



  const handleSubmitTest = async () => {
    if (confirm("Are you sure you want to submit the test?")) {
      const results = calculateTestResults()
      if (!results) return

      try {


        // Save result to backend
        const res = await axios.post("http://172.20.10.3:5000/api/test-result/save", {
          ...results,
          testId: params.testId,
        }, { headers })
        sessionStorage.setItem("testResult", JSON.stringify(results))

        // Redirect to results screen
        router.push(`/test-series/${params.id}/test/${params.testId}/results`)
      } catch (error) {
        console.error("Error submitting test result:", error)
        alert("Failed to save result. Please try again.")
      }
    }
  }

  const calculateTestResults = () => {
    if (!test) return null;

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedAnswers = 0;
    let negativeMarks = 0;
    const totalMarks = test.questions.length;
    const totalQuestions = test.questions.length;
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);

    const subjectStats: Record<string, {
      attempted: number;
      correct: number;
      incorrect: number;
      skipped: number;
      timeSpent: number;
    }> = {};

    test.questions.forEach((question) => {
      const answer = answers[question.id.toString()];
      const subject = (question as any).subject || "General";

      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          attempted: 0,
          correct: 0,
          incorrect: 0,
          skipped: 0,
          timeSpent: 0,
        };
      }

      const stats = subjectStats[subject];

      if (!answer || answer.selectedOption === null) {
        skippedAnswers++;
        stats.skipped++;
      } else {
        stats.attempted++;
        stats.timeSpent += answer.timeSpent || 0;

        if (answer.selectedOption === question.correctAnswer) {
          correctAnswers++;
          stats.correct++;
          score++;
        } else {
          incorrectAnswers++;
          stats.incorrect++;
          score -= 0.33;
          negativeMarks += 0.33;
        }
      }
    });

    const attempted = correctAnswers + incorrectAnswers;
    const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : 0;
    const hours = Math.floor(totalTimeSpent / 3600);
    const minutes = Math.floor((totalTimeSpent % 3600) / 60);
    const secs = totalTimeSpent % 60;
    const timeTaken = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    const formattedTimeTaken = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    const weakChapters = Object.entries(subjectStats).map(([subject, data], index) => {
      const chapterAccuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
      const speed = data.attempted > 0 ? Math.round(data.timeSpent / data.attempted) : 0;

      return {
        id: index + 1,
        name: subject,
        score: data.correct,
        accuracy: chapterAccuracy,
        speed,
      };
    });

    // Mocking ranking and percentile
    const rank = Math.floor(Math.random() * 50000) + 100000; // 100000 to 150000
    const totalRanked = 148767;
    const percentile = Math.round(((totalRanked - rank) / totalRanked) * 100 * 100) / 100;

    // Mock top rankers
    const topRankers = [
      { rank: 1, name: "Anand Kanwar", score: 100, totalMarks },
      { rank: 2, name: "Ghanshyam Sh...", score: 99, totalMarks },
    ];

    return {
      rank,
      totalRanked,
      score: Math.max(0, Math.round(score * 100) / 100),
      totalMarks,
      attempted,
      totalQuestions,
      accuracy,
      percentile,
      timeTaken: timeTaken,
      totalTime: `${test.duration} min`,
      correctAnswers,
      incorrectAnswers,
      skippedAnswers,
      negativeMarks: Math.round(negativeMarks * 100) / 100,
      sectionalSummary: [
        {
          name: "Test",
          score: Math.max(0, Math.round(score * 100) / 100),
          totalMarks,
          attempted,
          totalQuestions,
          accuracy,
          timeTaken: timeTaken,
          totalTime: `${test.duration} min`,
        },
      ],
      weakChapters,
      topRankers,
      questionDistribution: {
        correct: correctAnswers,
        incorrect: incorrectAnswers,
        partiallyCorrect: 0,
        skipped: skippedAnswers,
      },
      userAnswers: answers,
      questions: test.questions,
    };
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <p className="text-gray-600">The test you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = test.questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id.toString()]
  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gray-100">
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
              <span className="text-gray-600">{test.title}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Time Left</div>
                <div className="font-mono text-lg font-bold">{formatTime(timeLeft)}</div>
              </div>

              <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                <Maximize className="h-4 w-4 mr-1" />
                Enter Full Screen
              </Button>

              <Button variant="outline" size="sm" onClick={togglePause}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">Verma</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Question */}
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          {/* Section Header */}
          <div className="mb-4">
            <div className="bg-teal-600 text-white px-4 py-2 rounded-t">
              <span className="font-medium">Test</span>
            </div>
          </div>

          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Question No. {currentQuestionIndex + 1}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Marks</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">+1</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">-0.33</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Time</span>
                <span className="text-sm">00:30</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">View in</span>
                <Select value={selectedLanguage}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {test.languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            </div>
          </div>

          {/* Question Content */}
          <div className="mb-8">
            <div className="text-lg leading-relaxed mb-6 whitespace-pre-line">{currentQuestion.question}</div>

            {/* Options */}
            <RadioGroup
              value={currentAnswer?.selectedOption?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(value)}
              className="space-y-4"
            >
              {Object.entries(currentQuestion.options).map(([key, option]) => (
                <div key={key} className="flex items-center space-x-3">
                  <RadioGroupItem value={key} id={`option-${key}`} />
                  <Label htmlFor={`option-${key}`} className="text-base cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleMarkForReview}>
                Mark for Review & Next
              </Button>
              <Button variant="outline" onClick={handleClearResponse}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear Response
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveAndNext} className="bg-blue-500 hover:bg-blue-600">
                Save & Next
              </Button>
              <Button onClick={handleSubmitTest} className="bg-teal-500 hover:bg-teal-600">
                Submit Test
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Navigation */}
        <div className="w-80 bg-blue-50 p-4 overflow-y-auto">
          {/* Status Summary */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>{statusCounts.answered} Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>{statusCounts.marked} Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>{statusCounts.notVisited} Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>{statusCounts.notAnswered} Not Answered</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>{statusCounts.markedAnswered} Marked and answered</span>
              </div>
            </div>
          </div>

          {/* Section */}
          <div className="mb-4">
            <div className="bg-blue-200 px-3 py-2 rounded">
              <span className="font-medium">SECTION : Test</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {test.questions.map((_, index) => {
              const status = getQuestionStatus(index)
              const isActive = index === currentQuestionIndex
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionSelect(index)}
                  className={`
                    w-10 h-10 rounded text-sm font-medium transition-all
                    ${isActive ? "ring-2 ring-blue-500" : ""}
                    ${getStatusColor(status)}
                    hover:scale-105
                  `}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="question-paper" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="question-paper">Question Paper</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="question-paper" className="mt-4">
              <div className="text-sm text-gray-600">Question paper content and navigation</div>
            </TabsContent>
            <TabsContent value="instructions" className="mt-4">
              <div className="text-sm text-gray-600">Test instructions and guidelines</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
