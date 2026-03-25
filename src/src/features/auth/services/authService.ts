import { createCrudService } from "@/config/crudFactory";
import { AuthDto, AuthResponse, ProfileResponse } from "../types/auth.types";
import axiosInstance from "@/config/axios";

export const authService = {
  ...createCrudService({
    basePath: "/auth",
    entity: {} as AuthResponse,
    postDto: {} as AuthDto,
    updateDto: {},
  }),

  local: {
    async login(payload: AuthDto) {
      const res = await axiosInstance.post<{ data: AuthResponse }>(
        "/auth/login",
        payload
      );
      return res;
    },
  },

  global: {
    async getProfile(token: string, params: Record<string, any> = {}) {
      const res = await axiosInstance.get<ProfileResponse>("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      return res.data;
    },
  },
};
