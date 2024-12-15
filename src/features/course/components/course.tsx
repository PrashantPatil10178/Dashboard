'use client'

import React from 'react'
import { any, number } from 'zod'
import { api } from '@/services/AxiosInterceptor'
import { CalendarIcon, TagIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCourses, Course } from '@/hooks/useCourses'
import useUserData, { User } from '@/hooks/useUserdata'
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

interface OrderResponse {
  orderId: string
  purchaseId: string
  amount: number
  currency: string
}

interface UserData {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  phoneNumber: number
  googleId: string | null
  role: string
  isActive: boolean
  enrolledCourses: Course[]
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CourseList() {
  const { toast } = useToast()
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUserData,
  } = useUserData()
  console.log(userData)
  const { data: courses, isLoading, error, refetch } = useCourses()
  const handlePayment = async (course: Course) => {
    console.log(course.price)
    try {
      const orderResponse = await api.post<OrderResponse>(
        'purchases/create-order',
        { courseId: course.id, amount: parseInt(course.price) }
      )
      console.log(orderResponse.amount)
      const options = {
        key: 'rzp_test_mZiJuQokh5wtMX',
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Parth Momaya',
        description: `Payment for ${course.title}`,
        image: 'https://your-logo-url.com',
        order_id: orderResponse.orderId,
        handler: async (response: any) => {
          try {
            await api.post('/purchases/verify-payment', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })
            await refetchUserData() // Refetch user data after successful purchase
            toast({
              title: 'Payment Successful',
              description: `You've successfully enrolled in ${course.title}`,
            })
          } catch (verificationError) {
            console.log(verificationError)
            toast({
              title: 'Payment Verification Failed',
              description: "Please contact support if you've been charged.",
              variant: 'destructive',
            })
          }
        },
        prefill: {
          name: userData?.name,
          email: userData?.email,
          number: Number(userData?.phoneNumber),
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

      razorpay.on('payment.failed', (response: any) => {
        toast({
          title: 'Payment Failed',
          description: response.error.description,
          variant: 'destructive',
        })
      })
    } catch (err) {
      console.log(err)
      toast({
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold mb-8 text-center'>
          Loading Courses...
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, index) => (
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
          Failed to fetch courses. Please try again later.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8 text-center'>Available Courses</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => handlePayment(course)}
              isLoadingUser={isLoadingUser}
              userData={userData as UserData}
            />
          ))
        ) : (
          <div className='col-span-full text-center py-10'>
            <p className='text-muted-foreground'>
              No courses available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CourseCardProps {
  course: Course
  onEnroll: () => void
  isLoadingUser: boolean
  userData: UserData
}

function CourseCard({
  course,
  onEnroll,
  isLoadingUser,
  userData,
}: CourseCardProps) {
  const isEnrolled = userData?.enrolledCourses?.some(
    (enrolledCourse) => enrolledCourse.id === course.id
  )

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
        {isEnrolled ? (
          <Button
            className='w-full'
            onClick={() => {
              /* Add logic to continue learning */
            }}
          >
            Continue Learning
          </Button>
        ) : (
          <>
            <div>
              <span className='text-sm text-muted-foreground line-through mr-2'>
                ₹{(parseInt(course.price) * 2).toFixed(2)}
              </span>
              <span className='text-2xl font-bold'>₹{course.price}</span>
            </div>
            <Button onClick={onEnroll} disabled={isLoadingUser}>
              Enroll Now
            </Button>
          </>
        )}
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
        <Skeleton className='h-6 w-16' />
        <Skeleton className='h-10 w-24' />
      </CardFooter>
    </Card>
  )
}
