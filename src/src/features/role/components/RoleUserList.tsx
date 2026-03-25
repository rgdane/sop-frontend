"use client";
import { useEffect, useMemo } from "react";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import { User } from "@/types/data/user.types";
import { TableBuilderProps } from "@/types/props/table.types";
import { useUserAction } from "@/features/user/hook/useUser";
import TableSearch from "@/components/ui/Table/ColumnSearch";
import { renderTags } from "@/components/ui/Tag";
import { useRoleAction } from "../hook/useRole";

export default function RoleUserList() {
  const {
    users,
    isLoadingUsers,
    setUserParams,
    updateUser,
    bulkUpdateUsers
  } = useUserAction();
  const { roles } = useRoleAction();

  useEffect(() => {
    setUserParams({ preload: true });
  }, []);

  const handleUpdate = async (id: number, data: Partial<User>) => {
    const formattedData = {
      ...data,
      has_roles: Array.isArray(data.has_roles)
        ? data.has_roles.map((r) => (typeof r === "object" ? r.id : r))
        : [],
    };
    await updateUser(id, formattedData);
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<User>) => {
    await bulkUpdateUsers(ids, data);
  };

  const roleOptions = useMemo(() => {
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles.map((role) => ({
      label: role.name,
      value: role.id,
    }));
  }, [roles]);

  const handleSearch = (value: any, record: any, key: string) => {
    const fieldValue = record[key];
    if (typeof fieldValue === "string" || typeof fieldValue === "number") {
      return String(fieldValue)
        .toLowerCase()
        .includes(String(value).toLowerCase());
    }
    return false;
  };

  const columns: TableBuilderProps<User>["columns"] = useMemo(() => {
    const uniqueRoles =
      users?.length > 0
        ? Array.from(
          new Set(
            users
              .flatMap((u) => u.has_roles?.map((r: any) => r.name) ?? [])
              .filter(Boolean)
          )
        ).map((role) => ({
          text: role,
          value: role,
        }))
        : [];

    return [
      {
        key: "name",
        title: "Name",
        dataIndex: "name",
        inputType: "text",
        editable: false,
        renderDataView: true,
        placeholder: "Masukkan nama",
        rules: [{ required: true, message: "Nama wajib diisi" }],
        ...TableSearch("Cari nama", {
          onSearch: (value, record) => {
            return handleSearch(value, record, "name");
          },
        }),
      },
      {
        key: "has_roles",
        dataIndex: "has_roles",
        title: "Roles",
        inputType: "multiSelect",
        editable: true,
        options: roleOptions,
        renderDataView: true,
        placeholder: "Masukkan role",
        rules: [{ required: true, message: "Role wajib diisi" }],
        filterSearch: true,
        filters: uniqueRoles,
        onFilter: (value, record) => {
          const userRoles = record.has_roles?.map((r: any) => r.name) ?? [];
          return userRoles.includes(value);
        },
        renderCell: (_: unknown, record: User) => {
          if (!Array.isArray(record.has_roles) || !Array.isArray(roles)) {
            return null;
          }

          const userRoles = record.has_roles
            .map((r) =>
              typeof r === "object"
                ? r
                : roles.find((role) => role.id === r)
            )
            .filter(Boolean);

          return renderTags(userRoles);
        },
      },
    ];
  }, [users, roles, roleOptions]);

  return (
    <TableBuilder<User>
      useDelete={false}
      useBulkAction={true}
      useHeaderAction={false}
      useFooterAction={false}
      datas={users}
      columns={columns}
      onUpdate={handleUpdate}
      onBulkUpdate={handleBulkUpdate}
      loading={isLoadingUsers}
      deleteConfirmTitle="Hapus Karyawan ini?"
      emptyRecord={{ name: "" }}
    />
  );
}