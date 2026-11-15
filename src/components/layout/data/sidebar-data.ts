import {
  Heart,
  Pill,
  Calendar,
  Sparkles,
  Mail,
  ShieldCheck,
  UserCheck,
  Settings,
  Activity,
  Globe2,
  ListTodo,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Sanjai Gopal',
    email: 'sanjai23062008g@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
  },
  teams: [
    {
      name: 'CareNest AI',
      logo: Heart,
      plan: 'Amma Lakshmi (74y)',
    },
    {
      name: 'Apollo Clinical Circle',
      logo: Activity,
      plan: 'Dr. Ramanathan, MD',
    },
    {
      name: 'Global Care Network',
      logo: Globe2,
      plan: 'Chennai • SF • Appwrite sgp',
    },
  ],
  navGroups: [
    {
      title: 'Healthcare Management',
      items: [
        {
          title: 'Care Dashboard',
          url: '/',
          icon: Activity,
        },
        {
          title: 'Senior Safe Mode',
          url: '/',
          icon: Heart,
        },
        {
          title: 'Medication Schedules',
          url: '/',
          icon: Pill,
        },
        {
          title: 'Doctor Appointments',
          url: '/',
          icon: Calendar,
        },
        {
          title: 'Gemini Safety Shield',
          url: '/',
          icon: Sparkles,
        },
        {
          title: 'Email Notification Engine',
          url: '/',
          icon: Mail,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
      ],
    },
    {
      title: 'Security & Access',
      items: [
        {
          title: 'Passcode Security',
          url: '/',
          icon: ShieldCheck,
          badge: 'CARE-8492',
        },
        {
          title: 'Family Caregivers',
          url: '/',
          icon: UserCheck,
        },
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Account',
              url: '/settings/account',
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
            },
          ],
        },
      ],
    },
  ],
}
