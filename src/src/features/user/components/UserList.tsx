"use client";
import { useEffect, useState } from "react";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import { useUserAction } from "../hook/useUser";
import { User } from "@/types/data/user.types";
import { CustomPagination, TableBuilderProps } from "@/types/props/table.types";
import { renderTag } from "@/components/ui/Tag";
import { useTitleActions } from "@/features/title/hook/useTitle";
import TableSearch from "@/components/ui/Table/ColumnSearch";
import { InfoModal } from "@/components/ui/Modal/InfoModal";
import { getSorterInfo } from "@/lib/tableHelper";
import { Input, Space } from "antd";
import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";

export default function UserList() {
  const {
    users,
    total,
    isLoadingUsers,
    setUserParams,
    createUser,
    updateUser,
    deleteUser,
    bulkCreateUsers,
    bulkUpdateUsers,
    bulkDeleteUsers,
  } = useUserAction();

  const { titles } = useTitleActions();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoRecord, setInfoRecord] = useState<any>(null);
  const [queryParam, setQueryParam] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { hasRestorePermission, hasActionPermission } = useFilterRBAC();

  const _PAGESIZE = 20;

  useEffect(() => {
    setUserParams({
      preload: true,
      limit: _PAGESIZE,
    });
  }, []);

  useEffect(() => {
    const cursor = currentPage === 1 ? 0 : (currentPage - 1) * _PAGESIZE;

    setUserParams({
      preload: true,
      limit: _PAGESIZE,
      ...(cursor > 0 && { cursor }),
      ...queryParam,
    });
  }, [queryParam, currentPage]);

  const handlePaginate: CustomPagination = {
    currentPage: currentPage,
    totalPage: Math.ceil((total || users.length) / _PAGESIZE),
    sizePage: _PAGESIZE,
    onLoadData: (page: number) => {
      setCurrentPage(page);
    },
  };

  const handleCreate = async (data: Omit<User, "id">) => {
    try {
      const payload = { ...data, name: data.name.toUpperCase() };
      await createUser(payload);
      setInfoRecord(data);
      setIsInfoOpen(true);
    } catch (error) {
      console.error("Create failed:", error);
    }
  };

  const handleUpdate = async (id: number, data: Partial<User>) => {
    if (data.password == "") {
      delete data.password;
    } else {
      data.is_password_default = true;
    }
    await updateUser(id, data);
  };

  const handleDelete = async (id: number, isPermanent?: boolean) => {
    await deleteUser({ id, isPermanent });
  };

  const handleBulkCreate = async (data: Omit<User, "id">[]) => {
    const payload = data.map((item) => ({ ...item, name: item.name.toUpperCase() }));
    await bulkCreateUsers(payload);
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<User>) => {
    await bulkUpdateUsers(ids, data);
  };

  const handleBulkDelete = async (ids: number[], isPermanent?: boolean) => {
    await bulkDeleteUsers(ids, isPermanent);
  };

  const handleSort = (sorter: any) => {
    setQueryParam((prev) => ({
      ...prev,
      sort: sorter[0]?.column,
      order: sorter[0]?.order,
    }));
  };

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setCurrentPage(1);
    setQueryParam((prev) => ({ ...prev, show_deleted: isDeleted }));
  };

  const handleRestore = async (ids: number[], deletedData: Partial<User>) => {
    await bulkUpdateUsers(ids, { deleted_at: null });
  };

  const titleOptions = titles.map((title) => ({
    label: title.name,
    value: title.id,
    color: title.color,
  }));

  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

  const defaultUserValues: any = () => {
    return {
      password: Array.from(
        { length: 8 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join(""),
    };
  };

  const columns: TableBuilderProps<User>["columns"] = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      editable: false,
      inputType: "custom",
      renderDataView: true,
      renderCell: (value: string) => (value ? value : "-"),
    },
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      inputType: "text",
      editable: true,
      renderDataView: true,
      placeholder: "Masukkan nama",
      rules: [{ required: true, message: "Nama wajib diisi" }],
      ellipsis: true,
      sorter: true,
      responsive: ["xs", "sm", "md", "lg"],
      ...TableSearch("Cari nama", {
        onSearch: (value: any) => {
          setCurrentPage(1);
          setQueryParam((prev) => ({ ...prev, name: value }));
          return false;
        },
        onReset: () => {
          setQueryParam((prev) => {
            const { name, ...rest } = prev;
            return rest;
          });
          return false;
        },
      }),
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      inputType: "text",
      editable: true,
      renderDataView: true,
      placeholder: "Masukkan email",
      rules: [{ required: true, message: "Email wajib diisi" }],
    },
    {
      key: "title_id",
      title: "Jabatan",
      dataIndex: "title_id",
      editable: true,
      inputType: "select",
      placeholder: "Pilih jabatan",
      options: titleOptions,
      renderCell: (value: number) => {
        if (!value) {
          return "-";
        }

        const titleData = titles.find((title) => title.id === value);
        if (titleData) {
          return renderTag(titleData.name, titleData.color);
        }

        return "-";
      },
    },
    {
      key: "password",
      title: "Password",
      dataIndex: "password",
      editable: true,
      inputType: "custom",
      renderInput: (value, record, form) => {
        const chars =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

        const generatePassword = () =>
          Array.from(
            { length: 8 },
            () => chars[Math.floor(Math.random() * chars.length)]
          ).join("");

        return (
          <Space.Compact style={{ width: "100%" }} size="middle">
            <Form.Item name="password" noStyle>
              <Input placeholder="Generate password" readOnly size="middle" />
            </Form.Item>
            <Button
              onClick={() => {
                const newPass = generatePassword();
                form.setFieldsValue({ password: newPass });
              }}
              style={{ height: "36px" }}
              size="middle"
            >
              Generate
            </Button>
          </Space.Compact>
        );
      },
      renderDataView: false,
    },
  ];

  return (
    <>
      <TableBuilder<User>
        datas={users}
        columns={columns}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkUpdate={handleBulkUpdate}
        onBulkCreate={handleBulkCreate}
        onBulkDelete={handleBulkDelete}
        filterDeleted={handleFilterDeleted}
        onRestore={handleRestore}
        loading={isLoadingUsers}
        addButtonText="Tambah Karyawan"
        deleteConfirmTitle="Hapus Karyawan ini?"
        useModal={true}
        onPaginate={handlePaginate}
        currentPage={currentPage}
        pageSize={_PAGESIZE}
        defaultValues={defaultUserValues()}
        onChange={(pagination, filters, sorter) => {
          const sort = getSorterInfo(sorter);
          handleSort(sort);
        }}
        title="User"
        useBulkAction={hasActionPermission()}
        useColumnAction={hasActionPermission()}
        useTrashFilter={hasRestorePermission()}
        useFooterAction={false}
      />
      <InfoModal
        key="info"
        open={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        record={infoRecord}
        columns={columns}
        entityName={"User"}
      />
    </>
  );
}