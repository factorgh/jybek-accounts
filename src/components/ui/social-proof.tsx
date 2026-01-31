"use client";

import * as React from "react";
import { Star, Users, TrendingUp, Award, CheckCircle } from "lucide-react";
import { Card, CardContent } from "./card";

interface TestimonialProps {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

function Testimonial({
  name,
  role,
  company,
  content,
  rating,
  avatar,
}: TestimonialProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600 mb-4 italic">"{content}"</p>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-600">
              {role}, {company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SocialProofProps {
  variant?: "testimonials" | "stats" | "combined";
}

export function SocialProof({ variant = "combined" }: SocialProofProps) {
  const testimonials: TestimonialProps[] = [
    {
      name: "Sarah Johnson",
      role: "CEO",
      company: "TechStart Inc.",
      content:
        "Jybek Accounts transformed how we manage our finances. The double-entry system gives us confidence in our numbers.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "CFO",
      company: "Growth Labs",
      content:
        "The best accounting software we've used. The API integration with our CRM saved us hours of manual work.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Founder",
      company: "Creative Studio",
      content:
        "Simple, powerful, and beautiful. Finally an accounting tool that designers love to use!",
      rating: 5,
    },
  ];

  const stats = [
    {
      icon: Users,
      label: "Active Businesses",
      value: "10,000+",
      change: "+25%",
    },
    {
      icon: TrendingUp,
      label: "Transactions Processed",
      value: "$2.5B+",
      change: "+40%",
    },
    {
      icon: Award,
      label: "Customer Satisfaction",
      value: "4.9/5",
      change: "+0.2",
    },
    { icon: CheckCircle, label: "Uptime", value: "99.9%", change: "Stable" },
  ];

  if (variant === "testimonials") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trusted by Thousands
          </h2>
          <p className="text-gray-600">See what our customers have to say</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            By the Numbers
          </h2>
          <p className="text-gray-600">
            Join thousands of successful businesses
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6">
              <CardContent className="p-0">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="text-xs font-medium text-green-600">
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Stats Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trusted by Industry Leaders
          </h2>
          <p className="text-gray-600">
            Join thousands of businesses managing their finances with confidence
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center p-6 hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="text-xs font-medium text-green-600">
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loved by Our Customers
          </h2>
          <p className="text-gray-600">Real stories from real businesses</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
}
