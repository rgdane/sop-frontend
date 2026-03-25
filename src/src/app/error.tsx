"use client";
import "@ant-design/v5-patch-for-react-19";
import ThemeSwitch from "@/components/fragments/ThemeSwitch";
import { Button, Result, Tooltip } from "antd";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  return (
    <div className="App bg-slate-50 dark:bg-[#262626] min-h-screen transition-colors duration-200">
      <div className="flex flex-col bg-[url('/bg.png')] w-full bg-cover h-screen">
        <div className="fixed px-12 py-4 flex items-center w-screen justify-between">
          <Tooltip title="Kembali ke Halaman Sebelumnya">
            <Button
              className="!text-[#262626] dark:!text-white "
              onClick={() => router.back()}
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
            status="500"
            title="500"
            subTitle={
              <>
                <p>Terjadi kesalahan pada sistem kami.</p>
                <p className="text-red-500 mt-2">Detail: {error.message}</p>
              </>
            }
            extra={
              <div className="flex justify-center gap-3.5">
                <Button onClick={reset}>Coba Lagi</Button>
                <Link href="/dashboard">
                  <Button type="primary">Kembali ke Beranda</Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
