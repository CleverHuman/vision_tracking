import { useAppStore } from "@/store/app-store";

export function useAuth() {
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const logout = useAppStore((s) => s.logout);

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    login,
    register,
    logout,
  };
}
