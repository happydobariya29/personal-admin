import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const RouteListener = () => {
  const location = useLocation()

  useEffect(() => {
    // Save the current path to localStorage on route change
    localStorage.setItem('lastRoute', location.pathname)
  }, [location])

  return null // No rendering needed
}

export default RouteListener
