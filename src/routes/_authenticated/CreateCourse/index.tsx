import { createFileRoute } from '@tanstack/react-router'
import Course from '@/features/createcourse'

export const Route = createFileRoute('/_authenticated/CreateCourse/')({
  component: Course,
})
