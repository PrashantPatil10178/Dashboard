'use client'

import React from 'react'
import { CalendarIcon, TagIcon } from 'lucide-react'
import { useCourseContent } from '@/hooks/useCourseContent'
import { Course } from '@/hooks/useCourses'
import useUserData from '@/hooks/useUserdata'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// interface Course {
//   id: number
//   title: string
//   description: string
//   price: string
//   category: string
//   imageUrl: string
//   tags: string[]
//   teacherId: number
//   createdAt: string
//   updatedAt: string
//   teacher?: {
//     name: string
//   }
// }

export default function EnrolledCoursesList() {
  const { data: userData, isLoading, error, refetch } = useUserData()
  const { data: userCourseData } = useCourseContent(1)
  console.log(userCourseData)

  if (isLoading) {
    return (
      <div className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold mb-8 text-center'>
          Loading Enrolled Courses...
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto py-8 text-center'>
        <h1 className='text-3xl font-bold mb-4'>Error</h1>
        <p className='text-red-500 mb-4'>
          Failed to fetch user data. Please try again later.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  const enrolledCourses: Course[] = userData?.enrolledCourses || []

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8 text-center'>
        Your Enrolled Courses
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((course: Course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className='col-span-full text-center py-10'>
            <p className='text-muted-foreground'>
              You are not enrolled in any courses yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CourseCardProps {
  course: Course
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <CardTitle className='text-xl'>{course.title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className='aspect-video w-full mb-4 bg-muted flex items-center justify-center rounded-md overflow-hidden'>
          {course.imageUrl ? (
            <img
              src={`http://localhost:4000/${course.imageUrl}`}
              alt={course.title}
              className='w-full h-full object-cover'
            />
          ) : (
            <span className='text-muted-foreground'>No image available</span>
          )}
        </div>
        <p className='text-muted-foreground mb-4 line-clamp-3'>
          {course.description}
        </p>
        {course.teacher && (
          <div className='flex items-center mb-2'>
            <Avatar className='h-6 w-6 mr-2'>
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${course.teacher.name}`}
              />
              <AvatarFallback>
                {course.teacher.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <span className='text-sm text-muted-foreground'>
              {course.teacher.name}
            </span>
          </div>
        )}
        <div className='flex items-center mb-2'>
          <CalendarIcon className='h-4 w-4 mr-2 text-muted-foreground' />
          <span className='text-sm text-muted-foreground'>
            {new Date(course.createdAt).toLocaleDateString()}
          </span>
        </div>
        {course.category && (
          <Badge variant='secondary' className='mb-2'>
            {course.category}
          </Badge>
        )}
        <div className='flex flex-wrap gap-2 mt-2'>
          {course.tags.map((tag, index) => (
            <Badge key={index} variant='outline' className='text-xs'>
              <TagIcon className='h-3 w-3 mr-1' />
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className='flex justify-between items-center'>
        <Button
          className='w-full'
          onClick={() => {
            console.log('Clicked')
          }}
        >
          Continue Learning
        </Button>
      </CardFooter>
    </Card>
  )
}

function CourseCardSkeleton() {
  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <Skeleton className='h-6 w-3/4' />
      </CardHeader>
      <CardContent className='flex-grow'>
        <Skeleton className='h-40 w-full mb-4' />
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-3/4 mb-4' />
        <Skeleton className='h-4 w-1/2 mb-2' />
        <Skeleton className='h-4 w-1/4' />
      </CardContent>
      <CardFooter className='flex justify-between items-center'>
        <Skeleton className='h-10 w-full' />
      </CardFooter>
    </Card>
  )
}
