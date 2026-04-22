"use client";

import { Wrapper } from "@/components/fragments/Wrapper";
import { Tag, Button } from "antd";

const ProfileAvatar = ({ name }: { name: string }) => {
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  
  return (
    <div className="w-16 h-16 flex items-center justify-center rounded-full text-xl font-bold bg-[#ffe2df] border border-[#ff675720] text-[#ff6757]">
      {getInitials(name)}
    </div>
  );
};

const TitleInfo = () => {
  return (
    <p className="font-medium opacity-50">Tidak ada informasi jabatan</p>
  );
};

export default function Profile() {
  return (
    <div className="space-y-8 mt-4">
      <div className="flex justify-between gap-6">
        <div className="flex items-center gap-6">
          <ProfileAvatar name="Guest" />
          <div>
            <p className="text-xl font-bold">Guest User</p>
            <p className="text-md opacity-80">guest@example.com</p>
          </div>
        </div>
      </div>

      <Wrapper title="Personal Info">
        <TitleInfo />
      </Wrapper>
    </div>
  );
}