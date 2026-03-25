"use client";
import "@ant-design/v5-patch-for-react-19";
import ThemeSwitch from "@/components/fragments/ThemeSwitch";
import { Button, Result, Tooltip } from "antd";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Loading from "../loading";
import { useRouter } from "next/navigation";

const Forbidden = () => {
  const router = useRouter();
  return (
    <Suspense fallback={<Loading />}>
      <div className="App bg-slate-50 dark:bg-[#262626] min-h-screen transition-colors duration-200">
        <div className="flex flex-col bg-[url('/bg.png')] w-full bg-cover h-screen">
          <div className="fixed px-12 py-4 flex items-center w-screen justify-between">
            <Tooltip title="Kembali ke Halaman Sebelumnya">
              <Button
                className="!text-[#262626] dark:!text-white "
                onClick={() => window.history.go(-2)}
                type="link"
                icon={<ArrowLeftOutlined />}
              >
                <p className="hover:opacity-80 hover:underline transition ease-in-out duration:200">
                  Kembali
                </p>
              </Button>
            </Tooltip>
            <ThemeSwitch />
          </div>
          <div className="justify-center items-center flex flex-col gap-y-16 h-screen">
            <Result
              status="403"
              title="403"
              subTitle="Anda tidak memiliki akses ke halaman ini."
              extra={
                <div className="flex justify-center gap-3.5">
                  <Link href="/dashboard">
                    <Button
                      type="primary"
                      className="transition-colors duration-200"
                    >
                      Ke Beranda
                    </Button>
                  </Link>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Forbidden;
