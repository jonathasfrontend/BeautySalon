'use client';

import React, { ReactNode } from 'react';
import { LucideIcon } from "lucide-react";
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string | ReactNode;
  value: string | number;
  change?: string | number | ReactNode;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon | string;
  variant?: "default" | "primary" | "accent";
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ title, value, icon, change, changeType = "neutral", variant = "default", trend }: StatCardProps) {
  const isLucideIcon = typeof icon !== 'string';
  
  return (
    <div
      className={cn(
        "stat-card",
        variant === "primary" && "gradient-primary text-primary-foreground",
        variant === "accent" && "bg-accent text-accent-foreground"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              "text-sm",
              variant === "default" ? "text-muted-foreground" : "opacity-90"
            )}
          >
            {title}
          </p>
          <p className="text-2xl font-bold mt-1">{value}</p>

          {(change || trend) && (
            <p
              className={cn(
                "text-sm mt-2 flex items-center gap-1",
                (changeType === "positive" || trend === "up") && variant === "default" && "text-success",
                (changeType === "negative" || trend === "down") && variant === "default" && "text-destructive",
                variant !== "default" && "opacity-80"
              )}
            >
              <span>{(changeType === "positive" || trend === "up") ? "↑" : (changeType === "negative" || trend === "down") ? "↓" : ""}</span>
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg",
            variant === "default" ? "bg-secondary" : "bg-white/20"
          )}
        >
          {isLucideIcon ? (
            <>{React.createElement(icon as LucideIcon, { className: "w-5 h-5" })}</>
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
      </div>
    </div>
  );
}
