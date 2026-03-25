"use client";

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useAuthAction } from "@/features/auth/hook/useAuth";

/**
 * This hook is used to initialize the auth state when the application starts.
 * It loads the user profile from the server if the user is logged in.
 *
 * @returns {boolean} - true if profile loaded successfully, false otherwise
 */
export const useAuthInitializer = (): boolean => {
  const [cookies] = useCookies(["token"]);
  const { getProfile } = useAuthAction();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (cookies.token === undefined) return;

    if (!cookies.token) {
      setInitialized(true);
      return;
    }

    const loadProfile = async () => {
      try {
        await getProfile(cookies.token, { preload: true });
      } finally {
        setInitialized(true);
      }
    };

    loadProfile();
  }, [cookies.token]);


  return initialized;
};
