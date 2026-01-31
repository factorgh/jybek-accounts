"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialProof } from "@/components/ui/social-proof";
import { Gamification, sampleAchievements } from "@/components/ui/gamification";
import { ProgressiveDisclosure } from "@/components/ui/progressive-disclosure";
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Trophy,
  Target,
  Star,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import Link from "next/link";

export default function EnhancedDashboardPage() {
  const breadcrumbItems = [{ label: "Dashboard", isActive: true }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Header with Gamification */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-orange-600">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">7 Day Streak!</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-purple-600">
                  <Trophy className="h-4 w-4" />
                  <span>Level 12 • 2,450 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Cards with Gamification */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    Total Revenue
                    <div className="flex items-center space-x-1">
                      <ArrowUpRight className="h-4 w-4" />
                      <Star className="h-3 w-3" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-blue-100 text-sm">
                    +20.1% from last month
                  </p>
                  <div className="mt-2 text-xs bg-blue-400 bg-opacity-30 rounded px-2 py-1 inline-block">
                    +50 XP for revenue growth
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    Total Expenses
                    <ArrowDownRight className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,456.78</div>
                  <p className="text-green-100 text-sm">
                    -5.3% from last month
                  </p>
                  <div className="mt-2 text-xs bg-green-400 bg-opacity-30 rounded px-2 py-1 inline-block">
                    Cost optimization bonus
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    Net Profit
                    <ArrowUpRight className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$32,775.11</div>
                  <p className="text-purple-100 text-sm">
                    +15.2% from last month
                  </p>
                  <div className="mt-2 text-xs bg-purple-400 bg-opacity-30 rounded px-2 py-1 inline-block">
                    Profit milestone achieved!
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    Cash Balance
                    <DollarSign className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$89,234.56</div>
                  <p className="text-orange-100 text-sm">Available funds</p>
                  <div className="mt-2 text-xs bg-orange-400 bg-opacity-30 rounded px-2 py-1 inline-block">
                    Healthy cash reserves
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions with Urgency */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h2>
                <div className="flex items-center space-x-2 text-sm text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>2 urgent tasks</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-orange-200 bg-orange-50">
                  <Link href="/transactions/create">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <DollarSign className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            New Transaction
                          </h3>
                          <p className="text-sm text-gray-600">
                            Record income or expense
                          </p>
                          <div className="mt-1 text-xs text-orange-600 font-medium">
                            3 pending entries
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href="/invoices/create">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Create Invoice
                          </h3>
                          <p className="text-sm text-gray-600">
                            Generate new invoice
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href="/customers">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Customers
                          </h3>
                          <p className="text-sm text-gray-600">
                            Manage customers
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href="/reports">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Reports</h3>
                          <p className="text-sm text-gray-600">
                            View analytics
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Recent Activity with Progressive Disclosure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Transactions
                    <Link href="/transactions">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Latest accounting transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Office Rent Payment
                          </p>
                          <p className="text-sm text-gray-600">Dec 15, 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">-$2,500.00</p>
                        <p className="text-xs text-gray-500">Expense</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Client Payment - ABC Corp
                          </p>
                          <p className="text-sm text-gray-600">Dec 14, 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +$5,000.00
                        </p>
                        <p className="text-xs text-gray-500">Income</p>
                      </div>
                    </div>

                    <ProgressiveDisclosure
                      title="Show more transactions"
                      variant="inline"
                    >
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              Software Subscription
                            </p>
                            <p className="text-sm text-gray-600">
                              Dec 13, 2024
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">
                              -$99.00
                            </p>
                            <p className="text-xs text-gray-500">Expense</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              Consulting Revenue
                            </p>
                            <p className="text-sm text-gray-600">
                              Dec 12, 2024
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              +$3,500.00
                            </p>
                            <p className="text-xs text-gray-500">Income</p>
                          </div>
                        </div>
                      </div>
                    </ProgressiveDisclosure>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Overview with Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Interactive revenue chart</p>
                      <p className="text-sm">
                        Connect chart library for visualization
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Enable Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
                <CardDescription>
                  Manage all your financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Transaction Center
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create, manage, and track all your accounting transactions
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Analytics</CardTitle>
                <CardDescription>
                  Deep insights into your business performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive reports and business intelligence
                  </p>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Gamification
              userPoints={2450}
              userLevel={12}
              achievements={sampleAchievements}
              nextLevelPoints={3000}
              streakDays={7}
            />
          </TabsContent>
        </Tabs>

        {/* Social Proof Section */}
        <div className="mt-12">
          <SocialProof variant="combined" />
        </div>
      </div>
    </div>
  );
}
