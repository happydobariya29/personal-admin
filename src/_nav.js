import { cilSpeedometer } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CNavItem, CNavTitle } from '@coreui/react'
import React from 'react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Modules',
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/base/users',
  },
  {
    component: CNavItem,
    name: 'Events',
    to: '/base/events',
  },
  {
    component: CNavItem,
    name: 'Announcements',
    to: '/base/announcements',
  },
  {
    component: CNavItem,
    name: 'Publications',
    to: '/base/publication',
  },
  {
    component: CNavItem,
    name: 'Matrimonial',
    to: '/base/matrimonial',
  },
  {
    component: CNavItem,
    name: 'Ads',
    to: '/base/ads',
  },
  {
    component: CNavItem,
    name: 'Business Connect',
    to: '/base/businessconnect',
  },
  {
    component: CNavItem,
    name: 'Donors',
    to: '/base/donors',
  },
  {
    component: CNavItem,
    name: 'Posts',
    to: '/base/post',
  },
  {
    component: CNavItem,
    name: 'Country',
    to: '/base/country',
  },
  {
    component: CNavItem,
    name: 'State',
    to: '/base/state',
  },
  {
    component: CNavItem,
    name: 'City',
    to: '/base/city',
  },
  {
    component: CNavItem,
    name: 'Feedback',
    to: '/base/feedback',
  },
  {
    component: CNavItem,
    name: 'Notification',
    to: '/base/notification',
  },
]

export default _nav
