"use client";
import CryptoJS from "crypto-js";
import { AuthDto } from "../types/auth.types";
import { authService } from "../services/authService";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  logout as logoutReducer,
  setCredentials,
  setPermissions,
  setAuthReady,
  setProjects,
  setTitle,
} from "../authSlice";
import { AppDispatch, RootState } from "@/store";
import { groupPermissions } from "@/lib/groupPermissions";
import { Squad } from "@/types/data/squad.types";
import { User } from "@/types/data/user.types";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key";
const MAX_AGE = 60 * 60 * 24 * 7;
const COOKIE_OPTIONS = {
  path: "/",
  maxAge: MAX_AGE,
  secure: false,
  sameSite: "lax" as const,
  httpOnly: false,
};

export type ModulePermissions = Record<string, boolean>;
export type NestedPermissions = Record<string, ModulePermissions>;
type CookieKey = "token" | "user" | "permissions" | "session_expiry";

const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (ciphertext: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText || null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export const useAuthAction = () => {
  const [cookies, setCookie, removeCookie] = useCookies([
    "token",
    "user",
    "permissions",
    "session_expiry",
  ]);
  const [toast] = useToast();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const projects = useSelector((state: RootState) => state.auth.projects);
  const title = useSelector((state: RootState) => state.auth.title);

  const setPlainCookie = (key: CookieKey, value: any) => {
    setCookie(key, value, COOKIE_OPTIONS);
  };

  const setEncryptedCookie = (key: CookieKey, value: any) => {
    const encryptedValue = encrypt(JSON.stringify(value));
    setCookie(key, encryptedValue, COOKIE_OPTIONS);
  };

  const getEncryptedCookie = (key: CookieKey) => {
    const encryptedValue = cookies[key];
    if (!encryptedValue) return null;

    const decryptedValue = decrypt(encryptedValue);
    if (!decryptedValue) return null;

    try {
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error("JSON parse error:", error);
      return null;
    }
  };

  const clearAllCookies = () => {
    const cookieKeys: CookieKey[] = ["token", "user", "permissions", "session_expiry"];
    cookieKeys.forEach((key) => removeCookie(key, { path: "/" }));
  };

  const login = async (payload: AuthDto, redirectUrl?: string) => {
    try {
      const res = await authService.local.login(payload);
      const { data } = res.data;
      const { token, id, name, email } = data;

      setPlainCookie("token", token);
      setPlainCookie("user", { id, name, email });
      setEncryptedCookie("session_expiry", new Date().getTime() + MAX_AGE * 1000);

      toast.success({ message: "Login sukses" });

      const targetUrl = redirectUrl || "/dashboard";
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 100);
    } catch (error: any) {
      toast.error({
        message: "Login gagal",
        description: error?.response?.data?.error || error.message,
      });
    }
  };

  const getProfile = async (token: string, params: Record<string, any> = {}) => {
    try {
      const profile = await authService.global.getProfile(token, params);
      const user = profile.data as User;
      const title: any = user.has_title ? user.has_title : null;
      const roles = user.has_roles ?? [];
      const flatPermissions = roles.flatMap(
        (role: any) => role.has_permission?.map((perm: any) => perm.name) ?? []
      );
      const groupedPermissions = groupPermissions(flatPermissions);

      const projects = user.has_squads?.length
        ? user.has_squads
          .flatMap((squad: any) => squad.projects ?? [])
          .filter(
            (project: any, index: number, self: any[]) =>
              index === self.findIndex((p) => p.id === project.id)
          )
        : null;

      dispatch(setCredentials({ token, user }));
      dispatch(setPermissions(groupedPermissions));
      dispatch(setAuthReady(true));
      dispatch(setTitle(title));
      dispatch(setProjects(projects));

      return { user, permissions: groupedPermissions };
    } catch (err: any) {
      clearAllCookies();
      dispatch(logoutReducer());
      toast.error({
        message: "Gagal mengambil data pengguna",
        description: err?.response?.data?.error || err.message,
      });
    }
  };

  const logout = () => {
    try {
      clearAllCookies();
      dispatch(logoutReducer());
      toast.success({ message: "Logout sukses" });
    } catch (error) {
      toast.error({ message: "Logout gagal" });
      throw error;
    }
  };

  const getCurrentUser = () => user;

  const getCurrentPermissions = (
    module?: string
  ): ModulePermissions | NestedPermissions | null => {
    if (!permissions) return null;
    return module ? permissions[module] ?? null : permissions;
  };

  const getCurrentToken = () => cookies.token;

  const getCurrentProjects = () => projects;

  const getCurrentTitle = () => title;

  const getCurrentSquads = (): Squad[] => user?.has_squads ?? [];

  const isSessionValid = () => {
    try {
      const expiry = getEncryptedCookie("session_expiry");
      if (!expiry) return false;
      return new Date().getTime() < expiry;
    } catch (error) {
      return false;
    }
  };

  return {
    login,
    getProfile,
    logout,
    getCurrentUser,
    getCurrentPermissions,
    getCurrentToken,
    getCurrentProjects,
    getCurrentTitle,
    getCurrentSquads,
    isSessionValid,
  };
};
