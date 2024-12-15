import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import EnrolledCoursesList from './components/EnrolledCourse'

export default function EnrolledCourse() {
  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <h1>Testing</h1>
        <EnrolledCoursesList />
      </Main>
    </>
  )
}
const topNav = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Courses',
    href: '/courses',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Students',
    href: '/students',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    isActive: false,
    disabled: false,
  },
]
