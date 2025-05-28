import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AuthUser } from "@/types";

export function useAuth() {
  return useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGoogleAuth() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return { handleGoogleLogin };
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      window.location.href = "/";
    },
  });
}
