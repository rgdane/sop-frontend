"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

const Pages = () => {
  const user = useSelector((state: RootState) => state.auth.user)

  const renderDashboard = () => {
    if (!user) return null;
  }

  return (
    <>
      {renderDashboard()}
    </>
  );
};

export default Pages;
