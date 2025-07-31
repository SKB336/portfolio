"use client"

import { useState, useEffect } from "react";

export default function ClockCard() {
    const [time, setTime] = useState(new Date());
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    useEffect(() => {
      const interval = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-2 md:p-6 text-center">
        {/* <h2 className="text-white text-xl font-semibold mb-4">Local Time</h2> */}
        <div className="text-sm md:text-3xl font-mono text-green-400">
          {time.toLocaleTimeString()}
        </div>
        {/* <div className="text-slate-400 text-sm">{timeZone}</div> */}
      </div>
    );
  }
  