"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { useCustomers } from "@/lib/hooks/useCustomers";

export default function CustomersPage() {
  const { customers, isLoading, error, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "suspended":
        return "Suspended";
      default:
        return status;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      const result = await deleteCustomer(id);
      if (!result.success) {
        alert(result.error || "Failed to delete customer");
      }
    }
  };

  const handleSeedCustomers = async () => {
    if (
      window.confirm(
        "This will clear all existing customers and add default customers. Are you sure?",
      )
    ) {
      try {
        setIsSeeding(true);
        const response = await fetch("/api/customers/seed", {
          method: "POST",
        });

        const result = await response.json();

        if (result.success) {
          alert(result.message || "Customers seeded successfully!");
          // Refresh the customers list
          window.location.reload();
        } else {
          alert(result.error || "Failed to seed customers");
        }
      } catch (error) {
        alert("An error occurred while seeding the customers");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/80 hover:bg-white"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      Customers
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Manage customer relationships and information
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleSeedCustomers}
                  disabled={isSeeding}
                  className="w-full sm:w-auto bg-white/80 hover:bg-white"
                >
                  {isSeeding ? "Seeding..." : "Seed Database"}
                </Button>
                <Link href="/customers/create">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    New Customer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customers.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customers.filter((c) => c.status === "active").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      customers.reduce((sum, c) => sum + c.balance, 0),
                    )}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Filter className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg. Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      customers.length > 0
                        ? customers.reduce((sum, c) => sum + c.balance, 0) /
                            customers.length
                        : 0,
                    )}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
            <CardDescription>
              Complete list of all customers and their account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading customers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Balance
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Invoices
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Created
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {customer.address || "No address"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">{customer.email}</p>
                            <p className="text-sm text-gray-600">
                              {customer.phone || "No phone"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p
                            className={`font-medium ${customer.balance > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {formatCurrency(customer.balance)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-2 h-2 rounded-full ${getStatusColor(customer.status)}`}
                              />
                              <span>{getStatusLabel(customer.status)}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">
                              {customer.totalInvoices}
                            </p>
                            <p className="text-sm text-gray-600">
                              {customer.paidInvoices} paid
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">
                            {formatDate(customer.createdAt)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Link href={`/customers/${customer.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <Button size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
