"use client";
import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import SopMap from "@/features/sop/components/SopMap";
import SopList from "@/features/sop/components/SopList";
import { Tabs } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Pages = () => {
  const searchParams = useSearchParams();
  const [activeKey, setActiveKey] = useState("1");

  useEffect(() => {
    const nodeParam = searchParams.get("node");
    if (nodeParam) {
      setActiveKey("2");
    }
  }, [searchParams]);

  return (
      <Tabs
        defaultActiveKey="1"
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          {
            label: "List SOP",
            key: "1",
            children: (
              <><PageSection title="SOP" key="tab-sopjob-table">
                <SopList />
              </PageSection></>
            ),
          },
          {
            label: "Peta SOP",
            key: "2",
            children: (
              <PageSection title="SOP" key="tab-sop-map">
                <SopMap />
              </PageSection>
            ),
          },
        ]}
      />
  );
};

export default Pages;
