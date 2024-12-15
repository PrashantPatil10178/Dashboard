import { createFileRoute } from '@tanstack/react-router'
import CreateCourseForm from '@/features/createcourse/components/CreateCourse'

export const Route = createFileRoute('/_authenticated/CreateCourse/')({
  component: CreateCourseForm,
})
