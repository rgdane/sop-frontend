"use client";
import { useState, useEffect, useRef, useLayoutEffect, Suspense } from "react";
import { gsap } from "gsap";
import "@ant-design/v5-patch-for-react-19";
import ThemeSwitch from "@/components/fragments/ThemeSwitch";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { QuoteDisplay } from "@/components/ui/QuoteDisplay";

const backgroundImages = [
  '/background/background-2.jpg',
  '/background/background-1.jpg',
  '/background/background-3.jpg',
  '/background/background-4.jpg',
  '/background/background-5.jpg'
];

const Login = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Buat ref untuk menargetkan elemen kolom
  const leftColRef = useRef(null);
  const rightColHeadRef = useRef(null);
  const rightColFormRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 100000);
    return () => clearInterval(intervalId);
  }, []);

  // Gunakan useLayoutEffect untuk animasi on-load
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(leftColRef.current, {
        y: 50,
        opacity: 0,
        duration: 2,
        ease: "power3.out",
      })
        .from(rightColHeadRef.current, {
          y: -50,
          opacity: 0,
          duration: 1.5,
          ease: "power3.out",
        }, "-=1")
        .from(rightColFormRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.5,
          ease: "power3.out",
        }, "-=1.5");
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="App bg-slate-50 dark:bg-[#262626] min-h-screen">
      <div className="fixed top-0 right-0 p-4 sm:p-6 z-20">
        <ThemeSwitch />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* === KOLOM KIRI (VISUAL) === */}
        <div className="hidden lg:flex relative items-center justify-center">
          <div className="absolute inset-0 w-full h-full">
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
          <div ref={leftColRef} className="relative z-10 w-full h-1/2 p-12 flex items-center justify-center">
            <QuoteDisplay />
          </div>
        </div>

        {/* === KOLOM KANAN (FORM LOGIN) === */}
        <div className="flex items-center justify-center w-full h-full p-4">
          <div className="flex flex-col items-center gap-5 w-full max-w-xl">
            <div className="text-center mb-8">
              <h1 ref={rightColHeadRef} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Selamat Datang di Jalan Kerja
              </h1>
            </div>
            <div ref={rightColFormRef} >
              <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;