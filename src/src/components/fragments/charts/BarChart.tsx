import React from "react";
import Chart from "react-apexcharts";
import "@/styles/chart.css";

export type BarChartDataType = {
  series: { name: string; data: number[]; stack?: string }[];
  categories: string[];
  colors?: string[];
};

interface BarChartProps {
  title?: string;
  options?: ApexCharts.ApexOptions;
  datas: BarChartDataType;
  width?: string | number;
  height?: string | number;
}

export const BarChart = ({
  title = "Chart",
  options,
  datas,
  width = "100%",
  height = 300,
}: BarChartProps) => {
  const defaultOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 2,
        borderRadiusApplication: "end",
      },
    },
    stroke: {
      colors: ["transparent"],
      width: 5,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: datas.categories,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontWeight: 400,
    },
    colors: datas.colors,
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toString();
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const mergedOptions: ApexCharts.ApexOptions = {
    ...defaultOptions,
    ...options,
    chart: {
      ...defaultOptions.chart,
      ...options?.chart,
    },
    plotOptions: {
      ...defaultOptions.plotOptions,
      ...options?.plotOptions,
    },
    legend: {
      ...defaultOptions.legend,
      ...options?.legend,
    },
  };

  if (!datas.series || !datas.categories) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#242424] w-full xl:min-h-[30vh] lg:min-h-[30vh] py-4 px-6 rounded-2xl border border-black/10 dark:border-white/10">
      <div className="font-black text-xl">{title}</div>
      <Chart
        options={mergedOptions}
        series={datas.series}
        type="bar"
        width={width}
        height={height}
      />
    </div>
  );
};
