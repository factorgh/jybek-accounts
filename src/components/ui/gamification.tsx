"use client";

import * as React from "react";
import {
  Trophy,
  Target,
  Zap,
  Lock,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

interface GamificationProps {
  userPoints: number;
  userLevel: number;
  achievements: Achievement[];
  nextLevelPoints: number;
  streakDays: number;
}

export function Gamification({
  userPoints,
  userLevel,
  achievements,
  nextLevelPoints,
  streakDays,
}: GamificationProps) {
  const progressToNextLevel = (userPoints / nextLevelPoints) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 bg-gray-50";
      case "rare":
        return "border-blue-300 bg-blue-50";
      case "epic":
        return "border-purple-300 bg-purple-50";
      case "legendary":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600";
      case "rare":
        return "text-blue-600";
      case "epic":
        return "text-purple-600";
      case "legendary":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{userLevel}</div>
              <div className="text-purple-100 text-sm">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {userPoints.toLocaleString()}
              </div>
              <div className="text-purple-100 text-sm">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{streakDays}</div>
              <div className="text-purple-100 text-sm">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {achievements.filter((a) => a.unlocked).length}/
                {achievements.length}
              </div>
              <div className="text-purple-100 text-sm">Achievements</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-purple-100 mb-2">
              <span>Level {userLevel}</span>
              <span>
                {userPoints} / {nextLevelPoints} XP
              </span>
            </div>
            <div className="w-full bg-purple-300 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Achievements</h3>
          <Button variant="outline" size="sm">
            <Trophy className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-md",
                achievement.unlocked ? "" : "opacity-60",
                getRarityColor(achievement.rarity),
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      achievement.unlocked ? "bg-white" : "bg-gray-200",
                    )}
                  >
                    {achievement.icon}
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        getRarityTextColor(achievement.rarity),
                      )}
                    >
                      {achievement.rarity.charAt(0).toUpperCase() +
                        achievement.rarity.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500">
                      +{achievement.points} pts
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardTitle className="text-base mb-2">
                  {achievement.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-3">
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        achievement.unlocked ? "bg-green-500" : "bg-blue-500",
                      )}
                      style={{
                        width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {!achievement.unlocked && (
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <Lock className="h-3 w-3 mr-1" />
                    Complete to unlock
                  </div>
                )}

                {achievement.unlocked && (
                  <div className="mt-3 flex items-center text-xs text-green-600 font-medium">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Unlocked!
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Challenges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-orange-500" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Record 5 Transactions
                  </p>
                  <p className="text-sm text-gray-600">
                    Complete your daily bookkeeping
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-orange-600">3/5</div>
                <div className="text-xs text-gray-500">+50 XP</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Review Financial Report
                  </p>
                  <p className="text-sm text-gray-600">
                    Check your P&L statement
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">0/1</div>
                <div className="text-xs text-gray-500">+30 XP</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sample achievement data for demonstration
export const sampleAchievements: Achievement[] = [
  {
    id: "first-transaction",
    name: "First Steps",
    description: "Record your first transaction",
    icon: <Trophy className="h-5 w-5" />,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    rarity: "common",
    points: 10,
  },
  {
    id: "week-streak",
    name: "Consistency King",
    description: "Maintain a 7-day streak",
    icon: <Zap className="h-5 w-5" />,
    progress: 3,
    maxProgress: 7,
    unlocked: false,
    rarity: "rare",
    points: 50,
  },
  {
    id: "invoice-master",
    name: "Invoice Master",
    description: "Create 100 invoices",
    icon: <Award className="h-5 w-5" />,
    progress: 45,
    maxProgress: 100,
    unlocked: false,
    rarity: "epic",
    points: 100,
  },
  {
    id: "financial-guru",
    name: "Financial Guru",
    description: "Generate 50 financial reports",
    icon: <Star className="h-5 w-5" />,
    progress: 12,
    maxProgress: 50,
    unlocked: false,
    rarity: "legendary",
    points: 200,
  },
];
