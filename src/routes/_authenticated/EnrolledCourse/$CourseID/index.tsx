import { createFileRoute, redirect } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/services/AxiosInterceptor'
import EnrolledCourseContent from '@/features/enrolledCourse/Content'

export const Route = createFileRoute(
  '/_authenticated/EnrolledCourse/$CourseID/'
)({
  component: EnrolledCourseContent,
  loader: async ({ params }) => {
    const { CourseID } = params
    try {
      const data = await api.get(`/courses/${CourseID}/content`)
      console.log(data)
    } catch (error) {
      console.log(error, 'Reached')
      return redirect({
        to: '/404',
      })
    }
  },
})
