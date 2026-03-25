"use client";

import { useEffect, useState } from "react";
import { formatDateTimeWithDay } from "@/lib/formatDate";
import { ClockCircleOutlined } from "@ant-design/icons";

const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const formatted = formatDateTimeWithDay(new Date());
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-panel px-5 py-3 rounded-xl border border-black/10 dark:border-white/10 flex items-center gap-4">
      <ClockCircleOutlined className="text-orange-500! text-xl" />
      <span className="text-gray-900 dark:text-white text-lg font-bold tabular-nums">
        {currentDateTime}
      </span>
    </div>
  );
};

export default DateTimeDisplay;
