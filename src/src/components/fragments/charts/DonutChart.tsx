import React, { ReactNode } from "react";
import Chart from "react-apexcharts";
import "@/styles/chart.css";
import { twMerge } from "tailwind-merge";

export type TrackerProgressDataType = {
  progress: number,
  total: number
}

export type DonutChartDataType = {
  series: number[];
  labels: string[];
  colors: string[];
};
interface DonutChartProps {
  title?: ReactNode;
  options?: ApexCharts.ApexOptions;
  datas: DonutChartDataType;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const DonutChart = ({
  title,
  options,
  datas,
  width = "100%",
  height = 250,
  className,
}: DonutChartProps) => {
  const defaultOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      toolbar: {
        show: false,
      },
    },
    labels: datas.labels,
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        return opts.w.config.series[opts.seriesIndex].toString();
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: false,
              label: "Total",
              fontSize: "12px",
              fontWeight: 600,
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                return total.toString();
              },
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              color: "#373d3f",
              offsetY: 0,
              formatter: function (val: string) {
                return val;
              },
            },
          },
        },
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 400,
      itemMargin: {
        horizontal: 5,
        vertical: 5,
      },
    },
    colors: datas.colors,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      enabled: false,
      y: {
        formatter: function (val: number, opts) {
          const total = opts.w.globals.seriesTotals.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const percentage = ((val / total) * 100).toFixed(1);
          return `${val} (${percentage}%)`;
        },
      },
    },
  };

  const mergedOptions: ApexCharts.ApexOptions = {
    ...defaultOptions,
    ...options,
    labels: datas?.labels,
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

  // Validate data
  if (!datas || !Array.isArray(datas.series) || !Array.isArray(datas.labels)) {
   return (
     <div className={twMerge("bg-white dark:bg-[#242424] w-full py-4 px-6 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col justify-center items-center", className)} style={{ height: `${height}px` }}>
       <div className="text-gray-500">No data available</div>
     </div>
   );
 }

  if (datas.series.length !== datas.labels.length) {
    console.warn("DonutChart: series and labels length mismatch");
  }

  return (
    <div
      className={twMerge(
        "bg-white dark:bg-[#242424] w-full py-4 px-6 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col gap-4",
        className
      )}
    >
      {title && <h3 className="!font-black !text-xl">{title}</h3>}
      <Chart
        options={mergedOptions}
        series={datas.series || []}
        type="donut"
        width={width}
        height={height}
      />
    </div>
  );
  };
