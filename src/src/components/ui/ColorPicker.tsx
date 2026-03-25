import { ColorPicker as ColorPickerAntd, ColorPickerProps } from "antd";
import { useLayoutEffect, useState } from "react";

export default function ColorPicker(props: ColorPickerProps) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  return ready ? (
    <ColorPickerAntd format="hex" size="large" {...props} />
  ) : null;
}
