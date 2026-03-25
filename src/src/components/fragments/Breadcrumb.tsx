"use client";

import Link from "next/link";
import { Breadcrumb as AntdBreadcrumb, Skeleton } from "antd";
import { useBreadcrumb } from "@/components/providers/BreadcrumbProvider";

const formatLabel = (s: string) =>
  s
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface Props {
  exclude?: string[];
}

export default function Breadcrumb({ exclude = [] }: Props) {
  const { segments, labelMap, loadingMap } = useBreadcrumb();

  const items = segments
    .map(({ key, segment, href }) => {
      const isLoading = loadingMap[key];
      const raw = labelMap[key] || segment;
      const label = formatLabel(raw);

      return { label, href, isLoading };
    })
    .filter(
      ({ href }) =>
        !exclude.map((e) => e.toLowerCase()).includes(href.toLowerCase())
    )
    .map(({ label, href, isLoading }, index, arr) => {
      const currentSegment = href.split("/").pop() || "";
      const nextSegment = arr[index + 1]?.href.split("/").pop() || "";
      const isLast = index === arr.length - 1;

      // disable hanya kalau:
      // - dia bukan angka
      // - dan segmen berikutnya adalah angka
      // - dan segmen saat ini bukan 'project' (karena project punya halaman)
      const isParentOfDynamic =
        /^\d+$/.test(nextSegment) &&
        !/^\d+$/.test(currentSegment) &&
        currentSegment !== "project";

      const isClickable = !isParentOfDynamic && !isLast;

      return {
        title: isLoading ? (
          <Skeleton.Input
            active
            size="small"
            style={{ width: 60, height: 16 }}
          />
        ) : (
          <Link href={isClickable ? href : ""} key={href}>
            {label}
          </Link>
        ),
      };
    });

  return <AntdBreadcrumb items={items} />;
}
