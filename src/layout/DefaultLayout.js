import PropTypes from 'prop-types'
import React from 'react'
import { AppContent, AppFooter, AppHeader, AppSidebar } from '../components/index'

const DefaultLayout = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        {/* Pass setIsAuthenticated and isAuthenticated to AppHeader */}
        <AppHeader setIsAuthenticated={setIsAuthenticated} />
        <div className="body flex-grow-1">
          <AppContent isAuthenticated={isAuthenticated} />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

DefaultLayout.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired, // Ensure isAuthenticated is passed and required
  setIsAuthenticated: PropTypes.func.isRequired, // Ensure setIsAuthenticated is passed and required
}

export default DefaultLayout
