import { CContainer, CSpinner } from '@coreui/react'
// eslint-disable-next-line prettier/prettier
import PropTypes from 'prop-types'; // Import PropTypes
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
// eslint-disable-next-line prettier/prettier
import routes from '../routes'; // Import the routes config

const AppContent = ({ isAuthenticated }) => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={isAuthenticated ? <route.element /> : <Navigate to="/login" replace />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

// PropTypes for the AppContent component
AppContent.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired, // Validate isAuthenticated as a required boolean
}

export default React.memo(AppContent)
