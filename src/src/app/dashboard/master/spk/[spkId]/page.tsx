"use client";

import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import { SpkJobList } from "@/features/spk-job/components/SpkJobList";
import { SpkDetail } from "@/features/spk/components/SpkDetail";
import { SpkJob } from "@/types/data/spk_job.types";
import { useAppSelector } from "@/store/hook";
import { useState } from "react";
import { GitCommitVertical } from "lucide-react";
import { SpkJobFlowchart } from "@/features/spk-job/components/SpkJobFlowchart";
import ActivityLayout from "@/components/layout/ActivityLayout";

const Pages = () => {
  const isCollapsed = useAppSelector((state) => state.layout.collapsed);
  const [activePanel, setActivePanel] = useState<string | null>("");
  const [spkJobs, setSpkJobs] = useState<SpkJob[]>([]);
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
      content: <SpkJobFlowchart data={spkJobs} />,
    },
  ];
  return (
      <PageSection title="Detail SPK">
        <ActivityLayout
          left={
            <div className="lg:pr-10">
              <SpkDetail />
              <SpkJobList spkJobDatas={spkJobs} setSpkJobDatas={setSpkJobs} />
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
