import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/AxiosInterceptor'

interface Teacher {
  id: number
  name: string
}

export interface Course {
  id: number
  title: string
  description: string
  price: string
  category: string | null
  imageUrl: string | null
  tags: string[]
  teacherId: number
  createdAt: string
  updatedAt: string
  teacher: Teacher
}

export function useCourses() {
  return useQuery<Course[], Error>({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get<Course[]>('/courses')
      return response
    },
  })
}
