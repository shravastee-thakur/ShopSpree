import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
}

export interface AuthState {
  email: string | null;
  userInfo: UserInfo | null;
  accessToken: string | null;
  isVerified: boolean;
  role: string | null;

  setUserEmail: (email: string | null) => void;
  setUserInfo: (info: UserInfo | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsVerified: (status: boolean) => void;
  setRole: (role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      userInfo: null,
      accessToken: null,
      isVerified: false,
      role: null,

      setUserEmail: (email) => set({ email: email }),
      setUserInfo: (info) => set({ userInfo: info }),
      setAccessToken: (token) => set({ accessToken: token }),
      setIsVerified: (status) => set({ isVerified: status }),
      setRole: (role) => set({ role: role }),

      clearAuth: () =>
        set({
          email: null,
          accessToken: null,
          isVerified: false,
          role: null,
          userInfo: null,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        email: state.email,
        userInfo: state.userInfo,
        isVerified: state.isVerified,
        role: state.role,
      }),
    },
  ),
);
