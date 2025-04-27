"use client"
import Link from "next/link"
import { BarChart3, Users, FileText, ArrowUpRight, ArrowDownRight, BookOpen, Clock, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"



const API_BASE_URL = "http://13.203.232.106:5000/api"

export default function DashboardPage() {

  const token = localStorage.getItem('authToken');
  interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  }

  const [users, setUser] = useState<User[]>([])

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${API_BASE_URL}/auth/alluser?page=${2}&limit=10`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
      const data = await response.json()
      setUser(data.users)
    }

    fetchUser()
  }, [])

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const newUsers = users?.filter((user) => {
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    return now.getTime() - createdAt.getTime() < ONE_DAY_MS;
  });
  return (
    <div className="flex flex-col gap-4 w-full" >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>Add New Test</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,345</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +12.5%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +8.2%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.5%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500 flex items-center">
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                    -2.3%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹24,56,789</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +18.2%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Test Series Performance</CardTitle>
                <CardDescription>Monthly test completion and success rates</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-sm text-muted-foreground">Performance Chart Visualization</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Popular Test Series</CardTitle>
                <CardDescription>Top performing test series this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">UPSC CSE Prelims</span>
                    </div>
                    <div className="text-sm text-muted-foreground">4,256 users</div>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">SSC CGL Tier 1</span>
                    </div>
                    <div className="text-sm text-muted-foreground">3,879 users</div>
                  </div>
                  <Progress value={72} className="h-2" />
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Banking PO</span>
                    </div>
                    <div className="text-sm text-muted-foreground">2,654 users</div>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">GATE CSE</span>
                    </div>
                    <div className="text-sm text-muted-foreground">2,145 users</div>
                  </div>
                  <Progress value={58} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newUsers?.slice(0, 10).map((user) => (
                    <div key={user._id} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User Name {user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {/* {i} hour{i !== 1 ? "s" : ""} ago */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard/users">View all users</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Tests</CardTitle>
                <CardDescription>Recently added test series</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Test Series {i}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {i} day{i !== 1 ? "s" : ""} ago
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {i * 123}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard/tests">View all tests</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Releases</CardTitle>
                <CardDescription>Scheduled test series releases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Upcoming Test {i}</p>
                        <p className="text-xs text-muted-foreground">
                          Releasing in {i} day{i !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Ready
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View all scheduled releases
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics and insights about your test series</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Analytics Dashboard Content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Reports Dashboard Content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
