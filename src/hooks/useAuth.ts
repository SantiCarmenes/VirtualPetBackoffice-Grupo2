'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { setToken, removeToken, getToken, isAuthenticated as checkIsAuthenticated, MOCK_ADMIN_TOKEN } from '@/lib/auth'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  // TODO: activate login - revert to: const [isAuth, setIsAuth] = useState(false)
  const [isAuth, setIsAuth] = useState(true)

  useEffect(() => {
    // TODO: activate login - remove this auto-login dev bypass
    const token = getToken()
    if (!token) {
      setToken(MOCK_ADMIN_TOKEN)
    }
  }, [])

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.me(),
    enabled: isAuth,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setToken(data.accessToken)
      setIsAuth(true)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      router.push('/dashboard')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      removeToken()
      setIsAuth(false)
      queryClient.clear()
      router.push('/login')
    },
    onError: () => {
      removeToken()
      setIsAuth(false)
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
    isAuthenticated: isAuth,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
    isLoggingOut: logoutMutation.isPending,
  }
}
