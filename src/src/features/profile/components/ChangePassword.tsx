"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaveOutlined } from "@ant-design/icons";
import FormBuilder from "@/components/fragments/builder/FormBuilder";
import { useAuthAction } from "@/features/auth/hook/useAuth";
import { useUserAction } from "@/features/user/hook/useUser";
import { FormProps } from "@/types/props/form.types";
import { RuleObject } from "antd/es/form";
import { StoreValue } from "antd/es/form/interface";

const PASSWORD_FORM_FIELDS: FormProps[] = [
  {
    name: "old_password",
    label: "Password Lama",
    props: { placeholder: "Masukkan password lama" },
    type: "password",
  },
  {
    name: "new_password",
    label: "Password Baru",
    props: { placeholder: "Masukkan password baru" },
    type: "password",
  },
  {
    name: "confirm_password",
    label: "Konfirmasi Password",
    props: { placeholder: "Masukkan konfirmasi password" },
    type: "password",
    rules: [
      {
        required: true,
        message: "Konfirmasi password harus diisi!",
      },
      ({ getFieldValue }: { getFieldValue: (field: string) => string }) => ({
        validator(_: RuleObject, value: StoreValue) {
          if (!value || getFieldValue("new_password") === value) {
            return Promise.resolve();
          }
          return Promise.reject(
            new Error("Konfirmasi password tidak sama dengan password baru!")
          );
        },
      }),
    ],
  },
];

const CONFIRM_PROPS = {
  title: "Konfirmasi Perubahan Password",
  description: "Yakin ingin mengubah password?",
};

export default function ChangePassword() {
  const router = useRouter();
  const { getCurrentUser } = useAuthAction();
  const { updateUser } = useUserAction();
  const user = getCurrentUser();

  const handleUpdatePassword = async (values: Record<string, unknown>) => {
    if (!user?.id) return;

    try {
      await updateUser(user.id, {
        ...values,
        is_password_default: false,
      });
      router.push("/dashboard/profile");
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  return (
    <>
      <h2 className="text-lg dark:text-white text-black mt-4 mb-6">
        Ubah Password
      </h2>
      <div className="p-4 shadow rounded-xl border-2 dark:border-white/10 border-black/10 bg-white dark:bg-[#242424]">
        <FormBuilder
          useConfirm
          confirmProps={CONFIRM_PROPS}
          fields={PASSWORD_FORM_FIELDS}
          submitButtonText="Ubah Password"
          onSubmit={handleUpdatePassword}
          buttonProps={{
            icon: <SaveOutlined />,
            width: "fit",
            position: "end",
          }}
        />
      </div>
    </>
  );
}
