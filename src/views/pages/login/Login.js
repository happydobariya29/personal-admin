// export default Login

import { cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import axios from 'axios'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBackendURL } from '../../../util'

const Login = ({ setIsAuthenticated, setMobileNumber }) => {
  const [contactNumber, setContactNumber] = useState('')
  const [showOtpButton, setShowOtpButton] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // State to manage loading spinner
  const [successMessage, setSuccessMessage] = useState('') // State for success messages
  const navigate = useNavigate()
  const backendUrl = getBackendURL()

  const handleContactNumberChange = (e) => {
    const value = e.target.value
    if (/^\d{0,10}$/.test(value)) {
      setContactNumber(value)
      setShowOtpButton(value.length === 10)
    }
  }

  // Handle sending OTP
  const handleSendOtp = async () => {
    setLoading(true) // Set loading state to true
    if (contactNumber.length !== 10) {
      setError('Please enter a valid mobile number')
      setLoading(false) // Reset loading
      return
    }
    try {
      const response = await axios.post(`${backendUrl}/apis/authentication`, { contactNumber })
      if (response.data.status === 'true') {
        setOtpSent(true)
        setError('')
        setSuccessMessage('OTP sent successfully!')
      } else {
        setError('Failed to send OTP')
      }
    } catch (error) {
      setError('Error sending OTP')
    } finally {
      setLoading(false) // Reset loading
    }
  }

  const handleOtpChange = (e) => {
    setOtp(e.target.value)
  }

  // Handle OTP submission
  const handleSubmitOtp = async () => {
    setLoading(true) // Set loading state to true
    if (otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP')
      setLoading(false) // Reset loading
      return
    }
    try {
      const response = await axios.post(`${backendUrl}/apis/verify-otp`, { contactNumber, otp })
      if (response.data.status === 'true') {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.user.userId)
        // console.log(response.data.user.userId)
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        console.log('Hello')
        setMobileNumber(contactNumber) // Set mobile number if needed
        navigate('/dashboard') // Redirect to the dashboard
      } else {
        setError('Invalid OTP')
      }
    } catch (error) {
      setError('Error verifying OTP')
    } finally {
      setLoading(false) // Reset loading
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1 className="text-center pb-3">Login</h1>
                    <p className="text-body-secondary">Enter Mobile Number to Generate OTP</p>
                    {error && <CAlert color="danger">{error}</CAlert>} {/* Error Alert */}
                    {successMessage && <CAlert color="success">{successMessage}</CAlert>}{' '}
                    {/* Success Alert */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Mobile Number"
                        autoComplete="tel"
                        value={contactNumber}
                        onChange={handleContactNumberChange}
                        maxLength={10}
                      />
                    </CInputGroup>
                    {showOtpButton && (
                      <CRow className="mb-3">
                        <CCol xs={12} className="text-center">
                          <CButton color="primary" onClick={handleSendOtp} disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'} {/* Show loading text */}
                          </CButton>
                        </CCol>
                      </CRow>
                    )}
                    {otpSent && (
                      <>
                        <CInputGroup className="mb-3">
                          <CInputGroupText>OTP</CInputGroupText>
                          <CFormInput
                            type="text"
                            placeholder="Enter 4-digit OTP"
                            value={otp}
                            onChange={handleOtpChange}
                            maxLength={4}
                          />
                        </CInputGroup>
                        <CCol xs={12} className="text-center">
                          <CButton color="primary" onClick={handleSubmitOtp} disabled={loading}>
                            {loading ? 'Verifying...' : 'Submit OTP'} {/* Show loading text */}
                          </CButton>
                        </CCol>
                      </>
                    )}
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

// PropTypes for the Login component
Login.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
  setMobileNumber: PropTypes.func.isRequired,
}

export default Login
