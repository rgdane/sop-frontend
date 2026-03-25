import { DatePicker as DatePickerAntd, DatePickerProps } from "antd";
import { useLayoutEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import idID from "antd/es/date-picker/locale/id_ID";

interface CustomDatePickerProps extends DatePickerProps {
  showTime?: boolean;
}

function DatePicker({ showTime = false, ...props }: CustomDatePickerProps) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  const format = showTime ? "DD-MM-YYYY HH:mm:ss" : "DD-MM-YYYY";

  return ready ? (
    <DatePickerAntd
      locale={idID}
      format={format}
      showTime={showTime ? { format: "HH:mm:ss" } : false}
      {...props}
    />
  ) : null;
}

DatePicker.RangePicker = DatePickerAntd.RangePicker;

export default DatePicker;
