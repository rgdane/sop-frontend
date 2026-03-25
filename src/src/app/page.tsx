"use client";

import { useState } from "react";

export default function ErrorTest() {
  const [boom, setBoom] = useState(false);

  if (boom) {
    throw new Error("Error saat klik tombol");
  }

  return (
    <div className="p-4">
      <button
        onClick={() => setBoom(true)}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Trigger Error
      </button>
    </div>
  );
}
