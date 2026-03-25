"use client";
import "@ant-design/v5-patch-for-react-19";
import ThemeSwitch from "@/components/fragments/ThemeSwitch";
import { Button, Result } from "antd";
import { Suspense } from "react";
import Link from "next/link";
import Loading from "./loading";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();
  return (
    <Suspense fallback={<Loading />}>
      <div className="App bg-slate-50 dark:bg-[#262626] min-h-screen transition-colors duration-200">
        <div className="flex flex-col bg-[url('/bg.png')] w-full bg-cover h-screen">
          <div className="fixed px-12 py-4 flex w-full justify-end">
            <ThemeSwitch />
          </div>
          <div className="justify-center items-center flex flex-col gap-y-16 h-screen">
            <Result
              status="404"
              title="404"
              subTitle="Maaf, halaman yang Anda cari tidak ditemukan."
              extra={
                <div className="flex justify-center gap-3.5">
                  <Button onClick={() => router.back()}>Kembali</Button>

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
              className="text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default NotFound;
