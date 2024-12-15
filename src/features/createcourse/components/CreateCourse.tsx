import React, { useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/services/AxiosInterceptor'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/jpg',
]

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number'),
  category: z.string().optional(),
  tags: z.string().optional(),
  image: z
    .any()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .gif formats are supported.'
    )
    .optional(),
})

type CourseFormValues = z.infer<typeof courseSchema>

export default function CreateCourseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: '',
      tags: '',
    },
  })

  const onSubmit = async (data: CourseFormValues) => {
    setIsLoading(true)

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('price', data.price)
    if (data.category) formData.append('category', data.category)
    if (data.tags) {
      const tagsArray = data.tags.split(',').map((tag) => tag.trim())
      tagsArray.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag)
      })
    }
    if (data.image) {
      console.log('reacted')
      formData.append('image', data.image)
    }

    try {
      const response: any = await api.postFormData('/courses', formData)

      if (response.message === 'Course created successfully') {
        toast({
          title: 'Course created',
          description: 'Your new course has been successfully created.',
        })
      } else {
        throw new Error('Failed to create course')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem creating your course.',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>
          Fill in the details to create a new course.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter course title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter course description'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Enter course price'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter course category' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter tags separated by commas'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter tags separated by commas (e.g.,
                    javascript,programming,web)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='image'
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Course Image</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      accept='.jpg,.jpeg,.png,.gif'
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          onChange(file)
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a course image (max 5MB, formats: jpg, jpeg, png,
                    gif)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating Course
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
