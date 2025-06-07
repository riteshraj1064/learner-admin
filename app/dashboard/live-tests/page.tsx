"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MoreHorizontal,
  ChevronDown,
  Download,
  Plus,
  Search,
  Filter,
  FileText,
  Users,
  Calendar,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// API base URL
const API_BASE_URL = "http://13.235.79.13:5000/api"

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
  questions: string[]
  attempts: number
  tags: string[]
  published: boolean
  publishedAt?: string
  availableFrom: string
  availableTo?: string
  attemptedBy: Array<{
    user: string
    startedAt: string
  }>
  createdAt: string
}

export default function LiveTestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const token = localStorage.getItem('authToken');

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [testToDelete, setTestToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [liveTests, setLiveTests] = useState<LiveTest[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch live tests data
  useEffect(() => {
    const fetchLiveTests = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/live/live-tests?page=${page}&limit=10`,{
          headers: {
            Authorization: `Bearer ${token}`
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch live tests")
        }
        const data = await response.json()
        console.log(data.tests)
        setLiveTests(data.tests || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error("Error fetching live tests:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load live tests data. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLiveTests()
  }, [page, toast])

  // Filter tests based on search term and tag
  const filteredTests = liveTests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTag = selectedTag ? test.tags.includes(selectedTag) : true
    return matchesSearch && matchesTag
  })

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/livetests/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete live test")
      }

      toast({
        title: "Live Test deleted",
        description: "Live test has been deleted successfully",
      })

      // Remove the deleted test from the state
      setLiveTests(liveTests.filter((test) => test._id !== id))
      setTestToDelete(null)
    } catch (error) {
      console.error("Error deleting live test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete live test",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  // Get all unique tags from live tests
  const allTags = Array.from(new Set(liveTests.flatMap((test) => test.tags || [])))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Live Tests</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/live-tests/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Live Test
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Test Management</CardTitle>
          <CardDescription>Manage your live tests, view statistics, and track user engagement.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-2 sm:max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tests..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Tags
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedTag(null)}>All</DropdownMenuItem>
                    {allTags.map((tag) => (
                      <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                        {tag}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Languages</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.length > 0 ? (
                      filteredTests.map((test) => (
                        <TableRow key={test._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <span className="line-clamp-1">{test.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {test.duration} mins
                          </TableCell>
                          <TableCell>
                            {test.published ? (
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-500 text-amber-500">
                                Draft
                              </Badge>
                            )}
                            {test.isFree && (
                              <Badge className="ml-2" variant="secondary">
                                Free
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {test.questions.length || 0}
                          </TableCell>
                          <TableCell>
                            {test.languages.length > 1
                              ? `${test.languages[0]} +${test.languages.length - 1}`
                              : test.languages[0] || "None"}
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {test.attempts || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs">
                                {new Date(test.availableFrom).toLocaleDateString()}
                                {test.availableTo ? ` - ${new Date(test.availableTo).toLocaleDateString()}` : ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/live-tests/${test._id}`)}>
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/live-tests/${test._id}/edit`)}>
                                  Edit live test
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setTestToDelete(test._id)}
                                >
                                  Delete live test
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No live tests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page <= 1 || loading}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page >= totalPages || loading}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the live test and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => testToDelete && handleDelete(testToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
