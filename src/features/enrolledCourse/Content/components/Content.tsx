import React, { useState } from 'react'
import {
  PlayCircle,
  Book,
  Clock,
  Video,
  FileText,
  CreditCard,
  ChevronRight,
} from 'lucide-react'
import { useCourseContent } from '@/hooks/useCourseContent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoPlayer } from './VideoPlayer'

type CourseContentData = {
  title: string
  description: string
  tags: string[]
  subjects: Subject[]
}

type Subject = {
  id: number
  title: string
  chapters: Chapter[]
}

type Chapter = {
  id: number
  title: string
  videos: Video[]
  flashcards: Flashcard[]
}

type Video = {
  id: number
  title: string
  url: string
  duration: number
}

type Flashcard = {
  id: number
  title: string
  // Add any other properties that a flashcard might have
}

export default function CourseContent() {
  const courseId = 1 // This would typically come from a route parameter or prop
  const {
    data: courseContent,
    isLoading,
    isError,
  } = useCourseContent(courseId) as {
    data: CourseContentData | undefined
    isLoading: boolean
    isError: boolean
  }
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />
  if (!courseContent) return <NoContentMessage />

  const totalVideos = courseContent.subjects.flatMap((subject) =>
    subject.chapters.flatMap((chapter) => chapter.videos)
  ).length

  const totalDuration = courseContent.subjects
    .flatMap((subject) =>
      subject.chapters.flatMap((chapter) =>
        chapter.videos.reduce((acc, video) => acc + video.duration, 0)
      )
    )
    .reduce((acc, duration) => acc + duration, 0)

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <CourseHeader courseContent={courseContent} />
      <div className='mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <VideoSection selectedVideo={selectedVideo} />
          <CourseStats
            subjectsCount={courseContent.subjects.length}
            totalVideos={totalVideos}
            totalDuration={totalDuration}
          />
        </div>
        <div className='lg:col-span-1'>
          <CourseProgress />
          <CourseCurriculum
            subjects={courseContent.subjects}
            setSelectedVideo={setSelectedVideo}
          />
        </div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600'></div>
    </div>
  )
}

function ErrorMessage() {
  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='text-center text-red-500'>
        <h2 className='text-2xl font-bold mb-2'>Error</h2>
        <p>An error occurred while loading the course content.</p>
      </div>
    </div>
  )
}

function NoContentMessage() {
  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='text-center text-gray-500'>
        <h2 className='text-2xl font-bold mb-2'>No Content Available</h2>
        <p>There is no course content available at this time.</p>
      </div>
    </div>
  )
}

function CourseHeader({ courseContent }: { courseContent: CourseContentData }) {
  return (
    <Card className='overflow-hidden shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900'>
      <CardHeader className='p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white'>
        <CardTitle className='text-4xl font-extrabold mb-4 flex items-center'>
          <PlayCircle className='w-8 h-8 mr-3 text-yellow-300' />
          {courseContent.title}
        </CardTitle>
        <CardDescription className='text-gray-200 text-lg'>
          {courseContent.description}
        </CardDescription>
        <div className='flex flex-wrap gap-3 mt-4'>
          {courseContent.tags.map((tag, index) => (
            <Badge
              key={index}
              className='bg-purple-600 text-white px-3 py-1 rounded-full text-sm shadow-md hover:bg-purple-500 transition'
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

function VideoSection({ selectedVideo }: { selectedVideo: string | null }) {
  return (
    <Card className='mb-8'>
      <CardContent className='p-0 aspect-video'>
        {selectedVideo ? (
          <VideoPlayer url={selectedVideo} />
        ) : (
          <div className='flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'>
            Select a video to start watching
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CourseStats({
  subjectsCount,
  totalVideos,
  totalDuration,
}: {
  subjectsCount: number
  totalVideos: number
  totalDuration: number
}) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <StatItem icon={Book} label='Subjects' value={subjectsCount} />
      <StatItem icon={PlayCircle} label='Videos' value={totalVideos} />
      <StatItem
        icon={Clock}
        label='Total Length'
        value={formatDuration(totalDuration)}
      />
      <StatItem icon={CreditCard} label='Price' value='$' />
    </div>
  )
}

function CourseProgress() {
  return (
    <Card className='mb-8'>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={33} className='mb-2' />
        <p className='text-sm text-gray-600 dark:text-gray-400'>33% Complete</p>
      </CardContent>
    </Card>
  )
}

function CourseCurriculum({
  subjects,
  setSelectedVideo,
}: {
  subjects: Subject[]
  setSelectedVideo: React.Dispatch<React.SetStateAction<string | null>>
}) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleAccordion = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Curriculum</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type='multiple'
          value={openItems}
          onValueChange={setOpenItems}
          className='w-full'
        >
          {subjects.map((subject, subjectIndex) => (
            <AccordionItem key={subject.id} value={`subject-${subject.id}`}>
              <AccordionTrigger
                className='hover:bg-indigo-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition'
                onClick={() => toggleAccordion(`subject-${subject.id}`)}
              >
                <div className='flex items-center'>
                  <span className='text-xl font-bold mr-2 text-indigo-600'>
                    {subjectIndex + 1}.
                  </span>
                  <span className='text-lg font-medium'>{subject.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-4 pt-3 pb-5 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                {subject.chapters.map((chapter, chapterIndex) => (
                  <AccordionItem
                    key={chapter.id}
                    value={`chapter-${chapter.id}`}
                  >
                    <AccordionTrigger
                      className='hover:bg-indigo-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition'
                      onClick={() => toggleAccordion(`chapter-${chapter.id}`)}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <span className='text-lg font-medium mr-2 text-indigo-500'>
                            {subjectIndex + 1}.{chapterIndex + 1}
                          </span>
                          <span>{chapter.title}</span>
                        </div>
                        <div className='flex items-center text-sm text-gray-600'>
                          <StatBadge
                            icon={Video}
                            value={chapter.videos.length}
                          />
                          <StatBadge
                            icon={FileText}
                            value={chapter.flashcards.length}
                          />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='space-y-3 px-4 pt-2'>
                      {chapter.videos.map((video) => (
                        <div
                          key={video.id}
                          className='flex items-center justify-between px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition cursor-pointer'
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVideo(video.url)
                          }}
                        >
                          <span className='flex items-center'>
                            <PlayCircle className='w-5 h-5 mr-3 text-indigo-600' />
                            {video.title}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {formatDuration(video.duration)}
                          </span>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

type StatItemProps = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className='flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md'>
      <Icon className='w-6 h-6 text-indigo-600 mb-2' />
      <span className='text-lg font-semibold'>{value}</span>
      <span className='text-sm text-gray-600 dark:text-gray-400'>{label}</span>
    </div>
  )
}

type StatBadgeProps = {
  icon: React.ComponentType<{ className?: string }>
  value: number
}

function StatBadge({ icon: Icon, value }: StatBadgeProps) {
  return (
    <span className='flex items-center bg-indigo-200 dark:bg-gray-600 px-2 py-1 rounded-lg text-sm text-indigo-600 dark:text-gray-200 mr-2'>
      <Icon className='w-4 h-4 mr-1' />
      {value}
    </span>
  )
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return hours > 0
    ? `${hours}h ${minutes}m ${remainingSeconds}s`
    : minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`
}
