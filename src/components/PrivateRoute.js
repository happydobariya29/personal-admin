import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" />
}

// PropTypes for the PrivateRoute component
PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired, // Validate element as a required React element
  isAuthenticated: PropTypes.bool.isRequired, // Validate isAuthenticated as a required boolean
}

export default PrivateRoute
