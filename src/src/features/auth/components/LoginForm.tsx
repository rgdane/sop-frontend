"use client";

import {
  MailOutlined,
  KeyOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import FormBuilder from "@/components/fragments/builder/FormBuilder";
import { useAuthAction } from "../hook/useAuth";
import { FormProps } from "@/types/props/form.types";
import { useSearchParams } from "next/navigation";

export const LoginForm = () => {
  const { login } = useAuthAction();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const fields: FormProps[] = [
    {
      name: "email",
      type: "input",
      rules: [{ required: true, message: "Please input your email!" }],
      props: {
        size: "large",
        placeholder: "Email",
        prefix: <MailOutlined className="me-2" />,
      },
    },
    {
      name: "password",
      type: "password",
      rules: [{ required: true, message: "Please input your password!" }],
      props: {
        size: "large",
        placeholder: "Password",
        prefix: <KeyOutlined className="me-2" />,
        iconRender: (visible: boolean) =>
          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />,
      },
    },
  ];

  const handleSubmit = async (values: any) => {
    await login(values, redirectUrl || undefined);
  };

  return (
    <FormBuilder
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Sign In"
      autoComplete="on"
      buttonProps={{
        size: "middle",
        width: "fit",
        position: "end"
      }}
    />
  );
};
