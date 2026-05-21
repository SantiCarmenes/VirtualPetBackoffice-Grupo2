'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { toast } from 'sonner'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.me(),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      try {
        const user = await authService.me()
        if (user.role !== 'BACKOFFICE') {
          await authService.logout()
          queryClient.clear()
          toast.error('Usuario o contraseña inválidos')
          return
        }
        queryClient.invalidateQueries({ queryKey: ['auth'] })
        router.push('/dashboard')
      } catch {
        await authService.logout()
        queryClient.clear()
        toast.error('Usuario o contraseña inválidos')
      }
    },
    onError: () => {
      toast.error('Usuario o contraseña inválidos')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    },
    onError: () => {
      queryClient.clear()
      router.push('/login')
    },
  })

  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
    isLoggingOut: logoutMutation.isPending,
  }
}
