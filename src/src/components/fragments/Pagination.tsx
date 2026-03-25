import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import { useEffect, useRef, useState } from "react";
import { CustomPagination } from "@/types/props/table.types";

interface PaginationProps {
  datas: any[];
  onPaginate?: CustomPagination;
}

export const Pagination = ({ onPaginate, datas }: PaginationProps) => {
  const [page, setPage] = useState(onPaginate?.currentPage ?? 1);
  const pageDataRef = useRef<{ indexId: number }[]>([]);

  const handleChange = (action: string) => {
    if (!page || !onPaginate?.sizePage) return;

    let currentPage = page;
    let idx: number | undefined;

    if (action === "prev") {
      const result = handlePrev(currentPage, idx);
      currentPage = result.page;
      idx = result.index;
    }

    if (action === "next") {
      const result = handleNext(currentPage, idx);
      currentPage = result.page;
      idx = result.index;
    }

    if (currentPage <= 1) currentPage = 1;

    setPage(currentPage);
    onPaginate.onLoadData(currentPage, idx, setPage);
  };

  const handlePrev = (page: number, index: any) => {
    page--;

    index = pageDataRef.current[page - 2]?.indexId;
    return { page, index };
  };

  const handleNext = (page: number, index: any) => {
    page++;

    if (datas.length === 0) return { page, index };
    index = datas[datas.length - 1].id;

    pageDataRef.current[page - 2] = {
      indexId: datas[datas.length - 1].id,
    };
    return { page, index };
  };

  useEffect(() => {
    if (onPaginate?.currentPage && onPaginate.currentPage !== page) {
      setPage(onPaginate.currentPage);
    }
  }, [onPaginate?.currentPage]);

  return (
    <>
      {onPaginate?.totalPage! > 1 && (
        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1}
            className="!flex !items-center"
            onClick={() => {
              handleChange("prev");
            }}
          >
            <div className="flex items-center gap-1 px-1">
              <ChevronLeft size={16} />
              <span>Prev</span>
            </div>
          </Button>
          <span>
            Page {page} of {onPaginate?.totalPage}
          </span>
          <Button
            iconPosition="end"
            disabled={page === onPaginate?.totalPage}
            onClick={() => {
              handleChange("next");
            }}
          >
            <div className="flex items-center gap-1 px-1">
              <span>Next</span>
              <ChevronRight size={16} />
            </div>
          </Button>
        </div>
      )}
    </>
  );
};
