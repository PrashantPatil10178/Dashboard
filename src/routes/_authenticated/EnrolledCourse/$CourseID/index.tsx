import { createFileRoute, redirect } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/services/AxiosInterceptor'
import { useCourseContent } from '@/hooks/useCourseContent'

export const Route = createFileRoute(
  '/_authenticated/EnrolledCourse/$CourseID/'
)({
  component: RouteComponent,
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

function RouteComponent() {
  const { CourseID } = Route.useParams()
  const navigate = useNavigate()

  return (
    <div>
      <h1>Enrolled Course</h1>
      <p>You are viewing course ID: {CourseID}</p>
      <button onClick={() => navigate({ to: '/' })}>Go to Homepage</button>
    </div>
  )
}
