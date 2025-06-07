"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Star, BookOpen, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface TestSeries {
  _id: string
  title: string
  description: string
  image: string
  createdBy: string
  Category: string
  totalTests: number
  freeTests: number
  languages: string[]
  price?: string
  DiscountPrice?: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  message: string
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  testSeries: TestSeries[]
}

export default function TestSeriesPage() {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [filterBy, setFilterBy] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTestSeries()
  }, [currentPage, sortBy, filterBy, searchTerm])

  const fetchTestSeries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        search: searchTerm,
        sort: sortBy,
        filter: filterBy,
      })

      const response = await fetch(`http://13.235.79.13:5000/api/testseries`)
      const data: ApiResponse = await response.json()
      console.log(data)

      setTestSeries(data.testSeries)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Error fetching test series:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTestSeries = testSeries.filter(
    (series) =>
      series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Online Test Series</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Prepare for your exams with our comprehensive test series designed by experts
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search test series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="tests">Most Tests</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  <SelectItem value="free">Free Tests</SelectItem>
                  <SelectItem value="paid">Paid Series</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Test Series Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTestSeries.map((series) => (
                <TestSeriesCard key={series._id} series={series} />
              ))}
            </div>

            {filteredTestSeries.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No test series found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TestSeriesCard({ series }: { series: TestSeries }) {
  const hasDiscount =
    series.DiscountPrice && series.price && Number.parseFloat(series.DiscountPrice) < Number.parseFloat(series.price)

  const discountPercentage = hasDiscount
    ? Math.round(
        ((Number.parseFloat(series.price!) - Number.parseFloat(series.DiscountPrice!)) /
          Number.parseFloat(series.price!)) *
          100,
      )
    : 0

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
      <div className="relative">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={series.image || "/placeholder.svg?height=200&width=300"}
            alt={series.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white">{discountPercentage}% OFF</Badge>
          </div>
        )}

        {series.freeTests > 0 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">{series.freeTests} Free</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
          {series.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{series.description}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>{series.totalTests} Tests</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="h-4 w-4" />
            <span>Expert Made</span>
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1">
          {series.languages.map((language) => (
            <Badge key={language} variant="secondary" className="text-xs">
              {language}
            </Badge>
          ))}
        </div>

        {/* Price */}
        {series.price && (
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-green-600">₹{series.DiscountPrice}</span>
                <span className="text-lg text-gray-500 line-through">₹{series.price}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">₹{series.price}</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Link href={`/test-series/${series._id}`} className="flex-1">
            <Button className="w-full">View Details</Button>
          </Link>
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
