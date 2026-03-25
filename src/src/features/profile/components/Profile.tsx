"use client";

import { Wrapper } from "@/components/fragments/Wrapper";
import { List } from "@/components/ui/List";
import { useAuthAction } from "@/features/auth/hook/useAuth";
import { Tag, Button, Skeleton } from "antd";
import Link from "next/link";
import { MdBadge, MdCalendarToday, MdCorporateFare } from "react-icons/md";

interface UserTitle {
  name: string;
  department?: { name: string };
  position?: { name: string };
  level?: { name: string };
  created_at?: string;
}

interface UserRole {
  id: number;
  name: string;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const ProfileAvatar = ({ name }: { name: string }) => (
  <div className="w-16 h-16 flex items-center justify-center rounded-full text-xl font-bold bg-[#ffe2df] border border-[#ff675720] text-[#ff6757]">
    {getInitials(name)}
  </div>
);

const RoleTags = ({ roles }: { roles: UserRole[] }) => (
  <div className="flex flex-wrap gap-0 mt-1">
    {roles.map((role) => (
      <Tag
        key={role.id}
        style={{
          border: "1px solid #1890ff",
          backgroundColor: "#1890ff30",
          color: "#1890ff",
        }}
      >
        {role.name}
      </Tag>
    ))}
  </div>
);

const TitleInfo = ({ title }: { title?: UserTitle | null }) => {
  if (!title?.name) {
    return (
      <p className="font-medium opacity-50">Tidak mempunyai jabatan</p>
    );
  }

  const items = [
    { icon: <MdBadge size={24} />, label: "Jabatan", value: title.name },
    { icon: <MdCorporateFare size={24} />, label: "Department", value: title.department?.name },
    { icon: <MdCorporateFare size={24} />, label: "Position", value: title.position?.name },
    { icon: <MdBadge />, label: "Level", value: title.level?.name },
    {
      icon: <MdCalendarToday size={24} />,
      label: "Joined Date",
      value: title.created_at
        ? new Date(title.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        : null,
    },
  ];

  return (
    <div className="space-y-4">
      {items.map(
        ({ icon, label, value }) =>
          value && (
            <div className="">
              <div className="flex items-center gap-6">
                <div className="text-slate-500">{icon}</div>
                <div className="">
                  <div className="text-[10px] tracking-wider uppercase text-slate-400 font-bold">{label}</div>
                  <div className="text-[16px] mt-1">{value}</div>
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
};

const SquadList = ({ squads }: { squads?: any[] }) => {
  if (!squads?.length) {
    return (
      <p className="font-medium opacity-50">Tidak mempunyai squad</p>
    );
  }

  return <List items={squads} hasMore={false} onLoadMore={() => { }} />;
};

export default function Profile() {
  const { getCurrentUser } = useAuthAction();
  const user = getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-8 mt-4">
        <Skeleton active avatar paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-4">
      {/* Header Section */}
      <div className="flex justify-between gap-6">
        <div className="flex items-center gap-6">
          <ProfileAvatar name={user.name || ""} />
          <div>
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-md opacity-80">{user.email}</p>
            {user.has_roles && <RoleTags roles={user.has_roles} />}
          </div>
        </div>
        <div className="flex items-center">
          <Link href="/dashboard/profile/change-password">
            <Button>Edit Password</Button>
          </Link>
        </div>
      </div>

      {/* Title Section */}
      <Wrapper title="Personal Info">
        <TitleInfo title={user.has_title} />
      </Wrapper>

      {/* Squad Section */}
      <Wrapper title="Squad">
        <SquadList squads={user.has_squads} />
      </Wrapper>
    </div>
  );
}
