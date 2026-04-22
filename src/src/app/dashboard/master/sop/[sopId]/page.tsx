"use client";

import ActivityLayout from "@/components/layout/ActivityLayout";
import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import { SopJob } from "@/types/data/sop_job.types";
import { SopJobList } from "@/features/sop-job/components/SopJobList";
import { SopDetail } from "@/features/sop/components/SopDetail";
import { useAppSelector } from "@/store/hook";
import { GitCommitVertical } from "lucide-react";
import { useState } from "react";
import { SopJobFlowchart } from "@/features/sop-job/components/SopJobFlowchart";
import { useParams, useRouter } from "next/navigation";
import { EyeOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";

const Pages = () => {
  const isCollapsed = useAppSelector((state) => state.layout.collapsed);
  const [activePanel, setActivePanel] = useState<string | null>("");
  const [sopJobs, setSopJobs] = useState<SopJob[]>([]);
  const router = useRouter();
  const params = useParams();
  const id = params.sopId as string;  

  const activityItems = [
    {
      key: "flowchart",
      title: "Flowchart",
      icon: <GitCommitVertical />,
    },
  ];

  const panelItems = [
    {
      key: "flowchart",
      content: <SopJobFlowchart data={sopJobs} />,
    },
  ];

  return (
      <PageSection title="Detail SOP">
        <ActivityLayout
          left={
            <div className="lg:pr-10">
              <SopDetail />
              <SopJobList sopJobs={sopJobs} setSopJobs={setSopJobs} />
            </div>
          }
          panels={panelItems}
          setActiveKey={setActivePanel}
          isCollapsed={isCollapsed}
          activeKey={activePanel}
          menuItems={activityItems}
        />
      </PageSection>
  );
};

export default Pages;
