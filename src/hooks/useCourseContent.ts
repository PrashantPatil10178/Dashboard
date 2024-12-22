import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/AxiosInterceptor'

interface CourseContent {
  id: number
  title: string
  description: string

  subjects: Subject[]
  chapters: Chapter[]
  liveSessions: LiveSession[]
}

interface Video {
  id: number
  title: string
  url: string
  duration: number
}

interface Subject {
  id: number
  title: string
  order: number
  chapters: Chapter[]
}

interface Chapter {
  id: number
  title: string
  order: number
  flashcards: Flashcard[]
  videos: Video[]
}

interface Flashcard {
  id: number
  Front: string
  Back: string
}

interface LiveSession {
  id: number
  title: string
  scheduledStartTime: string
  scheduledEndTime: string
}

const fetchCourseContent = async (courseId: number): Promise<CourseContent> => {
  const response = await api.get<CourseContent>(`/courses/${courseId}/content`)
  return response
}

export const useCourseContent = (courseId: number) => {
  return useQuery({
    queryKey: ['courseContent', courseId],
    queryFn: () => fetchCourseContent(courseId),
    staleTime: 5 * 60 * 1000,
  })
}
