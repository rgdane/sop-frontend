"use client";

import { Form as FormAntd, FormProps as AntdFormProps } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { useLayoutEffect, useState } from "react";
import { ComponentProps } from "react";

function Form(props: ComponentProps<typeof FormAntd>) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  return ready ? <FormAntd {...props} /> : null;
}

Form.useForm = FormAntd.useForm;
Form.useFormInstance = FormAntd.useFormInstance;
Form.useWatch = FormAntd.useWatch;
Form.Item = FormAntd.Item;
Form.List = FormAntd.List;
Form.ErrorList = FormAntd.ErrorList;
Form.Provider = FormAntd.Provider;

export default Form;
