"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface Test {
  _id: string
  title: string
  duration: number
  questionCount: Number
  totalMarks: number
  totalQuestions: number
  languages: string[]
  instructions: string[]
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGQzMDdjNDZhODQwYTU1NGJiNzA2YyIsImlhdCI6MTc0ODc3MjA4NCwiZXhwIjoxNzUxMzY0MDg0fQ.w-9MYlXSKP8FyH-QfUhv6Y8Hwg9EOT1IRs-dNHgVUuQ";

const headers = {
  Authorization: `Bearer ${token}`,
};
export default function TestInstructionsPage() {
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestDetails()
  }, [params.testId])

  const fetchTestDetails = async () => {
    try {
      setLoading(true)

      // Fetch test details from API
      const response = await fetch(`http://172.20.10.3:5000/api/tests/${params.testId}`, { headers })
      if (!response.ok) throw new Error("Failed to fetch test details")
      const testData = await response.json()
    console.log(testData)

      const test: Test = {
        _id: testData._id,
        title: testData.title,
        duration: testData.duration,
        totalMarks: testData.questionCount,
        totalQuestions: testData.questionCount || testData.questions?.length || 100,
        languages: testData.languages || ["English", "Hindi"],
        instructions: [
          `The test contain single section having ${testData.questionCount || 100} questions.`,
          "Each question has 4 options out of which only one is correct.",
          `You have to finish the test in ${testData.duration} minutes.`,
          "Try not to guess the answer as there is negative marking.",
          "You will be awarded 1 mark for each correct answer and 0.33 marks will be deducted for each wrong answer.",
          "There is no negative marking for the questions that you have not attempted.",
        ],
      }
      setTest(test)
    } catch (error) {
      console.error("Error fetching test details:", error)
      // Fallback to mock data
      const mockTest: Test = {
        _id: params.testId as string,
        title: "RRB NTPC Graduate Level Full Test - 01",
        duration: 90,
        totalMarks: 100,
        totalQuestions: 100,
        languages: ["English", "Hindi"],
        instructions: [
          "The test contain single section having 100 questions.",
          "Each question has 4 options out of which only one is correct.",
          "You have to finish the test in 90 minutes.",
          "Try not to guess the answer as there is negative marking.",
          "You will be awarded 1 mark for each correct answer and 0.33 marks will be deducted for each wrong answer.",
          "There is no negative marking for the questions that you have not attempted.",
        ],
      }
      setTest(mockTest)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = () => {
    if (!selectedLanguage || !agreedToTerms) {
      alert("Please select a language and agree to the terms and conditions.")
      return
    }

    // Navigate to test interface
    router.push(`/test-series/${params.id}/test/${params.testId}/exam?lang=${selectedLanguage}`)
  }

  const handlePrevious = () => {
    router.back()
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
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
              <div className="text-right">
                <div className="text-sm text-gray-600">Maximum Marks: {test.totalMarks}</div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="font-medium">Verma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Test Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{test.title}</h1>
            <div className="flex justify-between items-center text-lg">
              <span>
                <strong>Duration:</strong> {test.duration} Mins
              </span>
              <span>
                <strong>Maximum Marks:</strong> {test.totalMarks}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Read the following instructions carefully.</h2>
            <ol className="space-y-3 text-gray-700">
              {test.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-medium">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <hr className="my-8 border-gray-200" />

          {/* Language Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="font-medium">Choose your default language:</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="-- Select --" />
                </SelectTrigger>
                <SelectContent>
                  {test.languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-red-600 text-sm">
              Please note all questions will appear in your default language. This language can be changed for a
              particular question later on
            </p>
          </div>

          {/* Declaration */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Declaration:</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                I have read all the instructions carefully and have understood them. I agree not to cheat or use unfair
                means in this examination. I understand that using unfair means of any sort for my own or someone else's
                advantage will lead to my immediate disqualification. The decision of Testbook.com will be final in
                these matters and cannot be appealed.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} className="px-8">
              Previous
            </Button>
            <Button
              onClick={handleStartTest}
              disabled={!selectedLanguage || !agreedToTerms}
              className="px-8 bg-blue-500 hover:bg-blue-600"
            >
              I am ready to begin
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
