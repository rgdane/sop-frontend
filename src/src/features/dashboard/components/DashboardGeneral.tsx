"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageSection } from "@/components/ui/PageSection";
import DashboardGreetings from "@/features/dashboard/components/DashboardGreetings";
import { DashboardWidget } from "@/features/dashboard/components/DashboardWidget";
import { BacklogItem } from "@/types/data/backlog_item.types";
import { MdEventRepeat, MdArrowForward, MdDescription, MdInventory2, MdThermostat } from "react-icons/md";
import { useSopActions } from "@/features/sop/hook/useSop";
import { Wrapper } from "@/components/fragments/Wrapper";

interface DashboardGeneralProps {
  titleId?: number;
  userId?: number;
  positionId?: number;
  squadId: number;
  squadLength: number;
}

const DashboardGeneral = ({
  titleId,
  userId,
  positionId,
  squadId,
  squadLength,
}: DashboardGeneralProps) => {
  const [loading, setLoading] = useState(false);
  const { countSops } = useSopActions();
  const router = useRouter();

  const [dataSop, setDataSop] = useState<number>(0);
  const [taskToday, setTaskToday] = useState<BacklogItem[]>([]);
  const [totalTaskToday, setTotalTaskToday] = useState<number>(0);
  const [weatherInfo, setWeatherInfo] = useState({
    city: "---",
    temp: "-",
    desc: "",
  });

  useEffect(() => {
    const fetchMainData = async () => {
      setLoading(true);
      try {
        const sopCount = await countSops({ title_id: titleId ? titleId : 0 });

        setDataSop(sopCount ?? 0);
        setTaskToday([]);
        setTotalTaskToday(0);
      } catch (err) {
        console.error("Error fetching main dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMainData();
  }, [userId, positionId, titleId]);

  useEffect(() => {
    const fetchWeatherByCoords = async (
      latitude: number,
      longitude: number
    ) => {
      try {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=aba4a73feee9ee67f44e67644e526311&units=metric&lang=id`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.name && weatherData.main) {
          const temperature = Math.round(weatherData.main.temp);
          const description = weatherData.weather[0].description;
          setWeatherInfo({
            city: weatherData.name,
            temp: `${temperature}°C`,
            desc: description,
          });
        } else {
          console.error("Invalid weather data received:", weatherData);
        }
      } catch (err) {
        console.error("Error fetching weather data by coordinates:", err);
      }
    };

    const fetchWeatherByIP = async () => {
      try {
        const locationData = await fetch("https://ipapi.co/json/");
        const locationJson = await locationData.json();
        const city = locationJson.city;

        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=aba4a73feee9ee67f44e67644e526311&units=metric&lang=id`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.name && weatherData.main) {
          const temperature = Math.round(weatherData.main.temp);
          const description = weatherData.weather[0].description;
          setWeatherInfo({
            city: weatherData.name,
            temp: `${temperature}°C`,
            desc: description,
          });
        } else {
          console.error("Invalid weather data received:", weatherData);
        }
      } catch (err) {
        console.error("Error fetching weather data by IP:", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.warn("Geolocation error:", error);
          fetchWeatherByIP();
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      fetchWeatherByIP();
    }
  }, []);

  const widgets = [
    {
      key: "daily-scrum",
      label: "Operational",
      title: "Daily Scrum",
      icon: <MdEventRepeat className="text-2xl" />,
      iconBgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      button: {
        text: "Go to Daily Page",
        icon: <MdArrowForward className="text-sm" />,
        onClick: () => router.push(`/dashboard/scrum/squad/${squadId}/daily`),
      },
    },
    {
      key: "data-sop",
      label: "SOP",
      title: "Data SOP",
      value: dataSop,
      icon: <MdDescription className="text-2xl" />,
      iconBgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      key: "task-todo",
      label: "Progress",
      title: "Task Todo",
      value: totalTaskToday,
      subtitle: totalTaskToday === 0 ? "All clear!" : "tasks",
      icon: <MdInventory2 className="text-2xl" />,
      iconBgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      key: "weather",
      label: "Local Weather",
      title: weatherInfo.city,
      value: weatherInfo.temp,
      subtitle: weatherInfo.desc,
      icon: <MdThermostat className="text-2xl" />,
      iconBgColor: "bg-slate-500/10",
      iconColor: "text-slate-400",
    },
  ];

  return (
    <div className="-mt-6">
      <PageSection title="Dashboard">
        <DashboardGreetings weatherInfo={weatherInfo} />
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {widgets.map((widget) => (
            <DashboardWidget
              key={widget.key}
              label={widget.label}
              title={widget.title}
              value={widget.value}
              subtitle={widget.subtitle}
              icon={widget.icon}
              iconBgColor={widget.iconBgColor}
              iconColor={widget.iconColor}
              button={widget.button}
            />
          ))}
        </section>
        <div className="mt-9">
        </div>
      </PageSection>
    </div>
  );
};

export default DashboardGeneral;
