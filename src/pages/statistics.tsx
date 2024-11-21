// src/pages/statistics/index.tsx
import { StatisticsCards } from "@/components/statistics/StatisticsCards";

export default function Statistics() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Statistics</h1>
      <StatisticsCards />
    </div>
  );
}