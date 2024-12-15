import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/AxiosInterceptor'
import { Course } from './useCourses'

interface UserData {
  user: User
}

export interface User {
  id: number
  name: string
  email: string
  avatarUrl: string | ''
  phoneNumber: number
  googleId: string
  role: string
  isActive: boolean
  enrolledCourses: Course[]
}

export default function useUserData() {
  return useQuery<User, Error>({
    queryKey: ['userData'],
    queryFn: async () => {
      const response = await api.get<UserData>('/auth/me')
      return response.user
    },
    enabled: !!api.getToken(),
  })
}
