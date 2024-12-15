import { createFileRoute } from '@tanstack/react-router'
import EnrolledCourse from '@/features/enrolledCourse'

export const Route = createFileRoute('/_authenticated/EnrolledCourse/')({
  component: EnrolledCourse,
})
