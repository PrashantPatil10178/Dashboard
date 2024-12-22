import { LinkProps } from '@tanstack/react-router'
import { User } from '@/hooks/useUserdata'

// interface User {
//   name: string
//   email: string
//   avatar: string
// }

interface Team {
  name: string
  logo: React.ElementType
  plan: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
}

export type NavItem =
  | (BaseNavItem & {
      items: (BaseNavItem & { url: LinkProps['to'] })[]
      url?: never
    })
  | (BaseNavItem & {
      url: LinkProps['to']
      items?: never
    })

interface NavGroup {
  title: string
  isAdmin?: boolean
  items: NavItem[]
}

interface SidebarData {
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup }
