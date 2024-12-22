import React from 'react'
import useUserData from '@/hooks/useUserdata'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useUserData()

  const filteredNavGroups = sidebarData.navGroups.filter(
    (group) => !group.isAdmin || (user && user.role === 'TEACHER')
  )

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        <>
          <SidebarHeader>
            <TeamSwitcher teams={sidebarData.teams} />
          </SidebarHeader>
          <SidebarContent>
            {filteredNavGroups.map((props) => (
              <NavGroup key={props.title} {...props} />
            ))}
          </SidebarContent>
          <SidebarFooter>
            <NavUser />
          </SidebarFooter>
        </>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
const SidebarSkeleton = () => (
  <>
    <SidebarHeader>
      <Skeleton className='h-10 w-[80%] rounded-md' />
    </SidebarHeader>
    <SidebarContent>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='space-y-2 p-4'>
          <Skeleton className='h-4 w-[50%]' />
          {[...Array(4)].map((_, j) => (
            <Skeleton key={j} className='h-8 w-[90%]' />
          ))}
        </div>
      ))}
    </SidebarContent>
    <SidebarFooter>
      <Skeleton className='h-12 w-full' />
    </SidebarFooter>
  </>
)
