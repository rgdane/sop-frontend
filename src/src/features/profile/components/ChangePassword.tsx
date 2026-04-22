"use client";

import { SaveOutlined } from "@ant-design/icons";
import FormBuilder from "@/components/fragments/builder/FormBuilder";
import { FormProps } from "@/types/props/form.types";

const PASSWORD_FORM_FIELDS: FormProps[] = [
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
  },
];

export default function ChangePassword() {
  const handleUpdatePassword = async (values: Record<string, unknown>) => {
    console.log("Password updated:", values);
  };

  return (
    <>
      <h2 className="text-lg dark:text-white text-black mt-4 mb-6">
        Ubah Password
      </h2>
      <div className="p-4 shadow rounded-xl border-2 dark:border-white/10 border-black/10 bg-white dark:bg-[#242424]">
        <FormBuilder
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