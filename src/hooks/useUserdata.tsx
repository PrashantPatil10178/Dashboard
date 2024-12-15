import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/AxiosInterceptor'
import { Course } from './useCourses'

interface UserData {
  user: User
}

interface User {
  id: number
  name: string
  email: string
  avatarUrl: string | ''
  phoneNumber: number | null
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
