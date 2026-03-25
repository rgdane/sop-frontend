import Button from "@/components/ui/Button";
import { RootState } from "@/store";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdWavingHand, MdWbSunny, MdCloud, MdArrowOutward, MdNightsStay } from "react-icons/md";
import { useSelector } from "react-redux";

interface DashboardGreetingsProps {
  weatherInfo?: {
    city: string;
    temp: string;
    desc: string;
  };
}

const DashboardGreetings = ({ weatherInfo }: DashboardGreetingsProps) => {
  const [now, setNow] = useState(new Date());

  const name = useSelector((state: RootState) => state.auth.user?.name);
  const hours = now.getHours();
  const time = hours < 12 ? "morning" : hours < 15 ? "noon" : hours < 18 ? "afternoon" : "evening";
  const router = useRouter();

  const greetings = (time: "morning" | "noon" | "afternoon" | "evening") => {
    switch (time) {
      case "morning":
        return "Selamat Pagi";
      case "noon":
        return "Selamat Siang";
      case "afternoon":
        return "Selamat Sore";
      case "evening":
        return "Selamat Malam";
      default:
        return "Selamat Datang";
    }
  };

  const quotes = (time: "morning" | "noon" | "afternoon" | "evening") => {
    switch (time) {
      case "morning":
        return "Awali hari dengan semangat baru. Berikut adalah ringkasan pekerjaan Anda pagi ini.";
      case "noon":
        return "Manfaatkan energi siang ini untuk menyelesaikan target Anda. Berikut adalah ringkasan pekerjaan Anda hari ini.";
      case "afternoon":
        return "Jangan lupa untuk menikmati waktu sore ini. Berikut adalah ringkasan pekerjaan Anda sore ini.";
      case "evening":
        return "Jangan lupa untuk menikmati waktu malam ini. Berikut adalah ringkasan pekerjaan Anda malam ini.";
      default:
        return "Siap untuk hari yang produktif? Berikut adalah ringkasan pekerjaan dan status operasional Anda hari ini.";
    }
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${dayName}, ${day} ${month}`;
  };

  const getTimeIcon = () => {
    switch (time) {
      case "morning":
        // Pagi: Cloudy + Sunny
        return (
          <div className="relative">
            <MdCloud className="text-6xl text-slate-300 dark:text-slate-500" />
            <MdWbSunny className="text-3xl text-yellow-500 absolute -top-2 -right-2" />
          </div>
        );
      case "noon":
        // Siang: Sunny
        return (
          <div className="relative">
            <MdWbSunny className="text-6xl text-yellow-500" />
          </div>
        );
      case "afternoon":
        // Sore: Sunny + Moon
        return (
          <div className="relative">
            <MdWbSunny className="text-6xl text-orange-400" />
            <MdNightsStay className="text-3xl text-indigo-400 absolute -top-2 -right-2" />
          </div>
        );
      case "evening":
        // Malam: Moon
        return (
          <div className="relative">
            <MdNightsStay className="text-6xl text-indigo-400" />
          </div>
        );
      default:
        return (
          <div className="relative">
            <MdWbSunny className="text-6xl text-yellow-500" />
          </div>
        );
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  return (
    <section className="my-8 hero-mesh-gradient rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-sm">
      <div className="relative z-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <MdWavingHand className="text-primary text-sm" />
          <span className="text-xs font-bold text-primary tracking-wide uppercase">Welcome Back</span>
        </div>
        <h1 className="text-3xl! font-black! text-charcoal dark:text-white">{"Halo"}, {name || "User"}</h1>
        <p className="text-[16px] text-slate-500 dark:text-slate-300 max-w-lg leading-relaxed">
          {quotes(time)}
        </p>
        <div className="flex items-center gap-4 ">
          <Button type="primary" size="large" onClick={() => router.push("/dashboard/scrum/todo")}>View Schedule</Button>
          <button className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center gap-1 hover:text-primary transition-colors">
            Recent activity <MdArrowOutward className="text-sm" />
          </button>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-6 bg-white/80 dark:bg-slate-panel/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 backdrop-blur-md shadow-sm">
        {getTimeIcon()}
        <div className="text-right">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{formatDate(now)}</p>
          <p className="text-2xl font-bold text-charcoal dark:text-white leading-none mt-1">{greetings(time)}</p>
          <div className="flex justify-end items-center gap-1 mt-1 text-slate-500 dark:text-slate-400 ">
            <Clock size={16} />
            <p className="mt-1">{formatTime(now)}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardGreetings;
