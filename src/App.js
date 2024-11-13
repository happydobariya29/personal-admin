import { CSpinner, useColorModes } from '@coreui/react'
import React, { Suspense, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import './scss/style.scss'
import Login from './views/pages/login/Login'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('')
  const [currentPath, setCurrentPath] = useState(window.location.hash)
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const authStatus = localStorage.getItem('isAuthenticated') === 'true'
    const lastPath = localStorage.getItem('lastPath')

    if (token && authStatus) {
      setIsAuthenticated(true)
      if (lastPath) {
        window.location.hash = lastPath // Navigate to last path on reload
      }
    } else {
      setIsAuthenticated(false)
      if (!lastPath) {
        localStorage.setItem('lastPath', '#/login')
      }
    }
  }, [])

  useEffect(() => {
    const updateLastPath = () => {
      const path = window.location.hash
      console.log('Current path saved:', path) // Debugging log
      localStorage.setItem('lastPath', path)
      setCurrentPath(path) // Update currentPath to trigger re-render if needed
    }

    // Initial save of last path on mount
    updateLastPath()

    // Listen for hash changes and update lastPath accordingly
    window.addEventListener('hashchange', updateLastPath)

    return () => {
      window.removeEventListener('hashchange', updateLastPath)
    }
  }, [currentPath]) // Dependency on currentPath
  const handleStorageChange = (event) => {
    if (event.key === 'token' && event.newValue === null) {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Set color mode based on URL or stored theme
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]

    if (theme) {
      setColorMode(theme)
    }

    if (!isColorModeSet()) {
      setColorMode(storedTheme)
    }
  }, [storedTheme, isColorModeSet, setColorMode])

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} setMobileNumber={setMobileNumber} />
            )
          }
        />

        {/* Private Routes */}
        <Route
          path="*"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              element={
                <DefaultLayout
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                />
              }
            />
          }
        />

        {/* Redirect root URL to login page if not authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Other Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/500" element={<Page500 />} />
      </Routes>
    </Suspense>
  )
}

export default App
