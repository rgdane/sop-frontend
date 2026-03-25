"use client";
import { useToast } from "@/components/providers/ToastProvider";
import { positionService } from "@/features/position/services/positionService";
import { formatColor } from "@/lib/formatColor";
import { Position } from "@/types/data/position.types";

export const usePositionActions = () => {
  const [toast] = useToast();

  const fetchPositions = async (
    params: Record<string, any> = {}
  ): Promise<Position[]> => {
    const res = await positionService.local.getAll(params);
    const positions = res.data.data.map((p) => ({
      ...p,
      color: formatColor(p.color)
    }))
    return positions;
  };

  const deletePosition = async (id: number) => {
    try {
      await positionService.local.remove(id);
      toast.success({ message: "Berhasil menghapus posisi" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus data posisi",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const createPosition = async (payload: any) => {
    try {
      const formattedPayload = {
              ...payload,
              color: formatColor(payload.color),
            };
      await positionService.local.post(formattedPayload);
      toast.success({ message: `Berhasil membuat ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data posisi",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updatePosition = async (id: number, payload: any) => {
    try {
      const formattedPayload = {
              ...payload,
              ...(payload.color && { color: formatColor(payload.color) }),
            };
      await positionService.local.update(id, formattedPayload);
      toast.success({ message: `Berhasil mengubah ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah data posisi",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreatePositions = async (data: Omit<Position, "id">[]) => {
    try {
      await positionService.bulkCreate(data);
      data.map((item) => {
        toast.success({
          message: `Berhasil membuat ${item.name}`,
        });
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkUpdatePositions = async (
    ids: number[],
    data: Partial<Position>
  ) => {
    try {
      await positionService.bulkUpdate(ids, data);
      toast.success({
        message: `Berhasil mengupdate ${ids.length} posisi`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkDeletePositions = async (ids: number[]) => {
    try {
      await positionService.bulkDelete(ids);
      toast.success({
        message: `Berhasil menghapus ${ids.length} posisi`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  return {
    fetchPositions,
    createPosition,
    deletePosition,
    updatePosition,
    bulkCreatePositions,
    bulkUpdatePositions,
    bulkDeletePositions,
  };
};
