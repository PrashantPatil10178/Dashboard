import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function WelcomeCard() {
  return (
    <Card className='bg-gradient-to-r from-yellow-500 to-red-500'>
      <CardHeader>
        <CardTitle className='text-white'>Welcome to Your Dashboard!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-white'>
          Here, you can track courses, students, and their engagement. Start by
          creating a course or exploring existing ones. Let’s make an impact!
        </p>
      </CardContent>
    </Card>
  )
}
