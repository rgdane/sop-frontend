"use client";

import { useState, useEffect } from "react";

interface Quote {
    text: string;
    author: string;
}

export const QuoteDisplay = () => {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/my-quotes");

                if (!response.ok) throw new Error("Failed to fetch quote");

                const data = await response.json();
                setQuote({ text: data.text, author: data.author });

            } catch (error) {
                console.error(error);
                if (!quote) {
                    setQuote({
                        text: "Cara terbaik untuk memulai adalah dengan berhenti berbicara dan mulai melakukan.",
                        author: "Walt Disney",
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuote();
        const intervalId = setInterval(fetchQuote, 100000);
        return () => clearInterval(intervalId);

    }, []);

    return (
        <div className="relative flex flex-col justify-center items-start h-full p-8 sm:p-12 bg-black/40 rounded-lg border border-white/10">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8"></div>
                </div>
            )}

            <div className={`transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {quote && (
                    <>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white z-10 leading-tight">
                            "{quote.text}"
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-white/70 z-10">
                            — {quote.author}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};