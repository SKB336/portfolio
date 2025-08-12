"use client";

import { useState, useEffect } from "react";

export default function ClockCard() {
    const [time, setTime] = useState<Date | null>(null);
  
    // After getting Mounted on SSR
    useEffect(() => {
      const interval = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm border hidden md:block border-slate-700 rounded-xl p-2 md:p-6 text-center">
        <div className="text-sm md:text-3xl font-mono text-green-400">
          {time?.toLocaleTimeString()}
        </div>
      </div>
    );
  }
  