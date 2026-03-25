"use client";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import { useRoleAction } from "../hook/useRole";
import { Role } from "@/types/data/role.types";
import { TableBuilderProps } from "@/types/props/table.types";
import { useUserAction } from "@/features/user/hook/useUser";

export default function RoleList() {
  const {
    roles,
    isLoadingRoles,
    createRole,
    deleteRole,
    updateRole,
    fetchRoles
  } = useRoleAction();

  const { fetchUsers } = useUserAction();

  const handleCreate = async (data: Omit<Role, "id">) => {
    try {
      await createRole(data);
      await fetchUsers({ preload: true });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (id: number, data: Partial<Role>) => {
    try {
      await updateRole(id, data);
      await fetchUsers({ preload: true });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      await fetchUsers({ preload: true });
    } catch (error) {
      console.error(error);
    }
  };

  const columns: TableBuilderProps<Role>["columns"] = [
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      inputType: "text",
      renderDataView: true,
      placeholder: "Masukkan nama role",
      rules: [{ required: true, message: "Nama wajib diisi." }],
    },
  ];

  return (
    <TableBuilder<Role>
      datas={roles}
      columns={columns}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      loading={isLoadingRoles}
      addButtonText="Add Role"
      deleteConfirmTitle="Hapus Role ini?"
    />
  );
}