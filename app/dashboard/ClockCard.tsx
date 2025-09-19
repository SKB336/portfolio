"use client";

import { useState, useEffect } from "react";

export default function ClockCard() {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [pay, setPay] = useState<number>(0);
    const [todayPay, setTodayPay] = useState<number>(0);
    const [showSecondary, setShowSecondary] = useState(false);

    function getWorkingDaysBeforeDate(year: number, month: number, day: number): number {
      // counts working days from 1 .. (day-1)
      let count = 0;
      for (let d = 1; d < day; d++) {
        const date = new Date(year, month, d);
        const dow = date.getDay(); // 0 = Sun, 6 = Sat
        if (dow !== 0 && dow !== 6) count++;
      }
      return count;
    }

    function getWorkingDaysInMonth(year: number, month: number): number {
      let count = 0;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
    
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
      }
    
      return count;
    }
    
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const numberOfWorkingDaysInMonth = getWorkingDaysInMonth(year, month);

    const startOfDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      9,
      30
    );

    const endOfDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      18, // 6 PM
      30  // :30
    );

    function calculatePay() {
      const currentTime = new Date();

      // Hours worked today, capped at 9
      let todayHours = Math.min(
        (currentTime.getTime() - startOfDay.getTime()) / (1000 * 60 * 60),
        9
      );
    
      // Add full hours from previous days (subtract 12 days, like Python code)
      // let hours = todayHours + (currentTime.getDate() - 1) * 9;

      const workingDaysBeforeToday = getWorkingDaysBeforeDate(year, month, currentTime.getDate());

      // total hours = full hours from previous working days + today's hours
      const hours = Math.max(0, todayHours + workingDaysBeforeToday * 9);
    
      const rate = 120000 / numberOfWorkingDaysInMonth / 9;
      const todayPay = todayHours * rate;
      const pay = hours * rate;
    
      setPay(pay);
      setTodayPay(todayPay);
    }
  
    function calculateTimeLeft() {
      const now = new Date();
      let diff = endOfDay.getTime() - now.getTime();
  
      if (diff <= 0) {
        setTimeLeft("Shift over 🎉");
        return;
      }
  
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }

    // After getting Mounted on SSR
    useEffect(() => {
      const interval = setInterval(() => calculateTimeLeft(), 1000);
      const interval2 = setInterval(() => calculatePay(), 1000);
      return () => {
        clearInterval(interval);
        clearInterval(interval2);
      };
    }, []);
  
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm border hidden md:block border-slate-700 rounded-xl p-2 md:p-6 text-center"
        onClick={() => setShowSecondary((prev) => !prev)}>
        <div className="text-sm md:text-3xl font-mono text-green-400">
        {showSecondary
          ? todayPay.toFixed(2) + "/" + pay.toFixed(2)
          : timeLeft}
        </div>
      </div>
    );
  }
  