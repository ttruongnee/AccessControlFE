import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            // ✅ Set auth data (KHÔNG cần refreshToken vì đã ở cookie)
            setAuth: (data) =>
                set({
                    user: data.user,
                    accessToken: data.accessToken,
                    isAuthenticated: true,
                }),

            // ✅ Clear auth data (logout)
            clearAuth: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                }),

            // ✅ Update user
            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
        }
    )
);