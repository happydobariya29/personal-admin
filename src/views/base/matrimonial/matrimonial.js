import { cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CForm,
  CFormInput,
  CFormLabel,
  CPagination,
  CPaginationItem,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { IoToggle } from 'react-icons/io5'
import { getBackendURL } from '../../../util'
import axiosInstance from '../services/axiosInstance'
const formatDateForDisplay = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

const calculateAge = (dateOfBirth) => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  // If the current month is before the birth month, or it's the birth month but the day is before the birth day, subtract one year from age
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

const getMaxDateOfBirth = () => {
  const today = new Date()
  const maxDate = new Date(today.setFullYear(today.getFullYear() - 18))
  return maxDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
}

const formatTimeForDisplay = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}
const formatDate = (dateString) => {
  if (!dateString) return '' // Handle undefined, null, or empty date strings

  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    // Handle invalid date cases
    return ''
  }

  return format(date, 'yyyy-MM-dd') // Assuming you're using date-fns
}

const Matrimonials = () => {
  const [matrimonialProfiles, setmatrimonialProfiles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedMatrimonialId, setSelectedMatrimonialId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [file, setFile] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)
  const [uploading, setUploading] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [sortFieldAsc, setSortFieldAsc] = useState('')
  const [sortFieldDesc, setSortFieldDesc] = useState('')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [minAge, setMinAge] = useState(null)
  const [maxAge, setMaxAge] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMatrimonial, setNewMatrimonial] = useState({
    matrimonialId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    contactNumber: '',
    dateOfBirth: '',
    age: '',
    profilePic: '',
    biodata: '',
    status: '',
  })
  const backendUrl = getBackendURL()

  useEffect(() => {
    fetchData()
  }, [])

  const handleMoreDetails = (matrimonialId) => {
    // Toggle visibility of details
    setSelectedMatrimonialId(selectedMatrimonialId === matrimonialId ? null : matrimonialId)
  }
  const fetchData = async (
    page = 1,
    limit = 10,
    term = '',
    sortField = '',
    sortOrder = '',
    minAge = '',
    maxAge = '',
  ) => {
    try {
      const response = await axiosInstance.get(`${backendUrl}/apis/matrimonialprofiles`, {
        params: {
          search: term,
          page: page,
          limit: limit,
          sortField, // Sorting field
          sortOrder, // Sorting order
          minAge: minAge || undefined,
          maxAge: maxAge || undefined,
        },
      })
      if (response.data && response.data.matrimonialProfiles) {
        setmatrimonialProfiles(response.data.matrimonialProfiles)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.currentPage)
      } else {
        console.error('Unexpected response structure:', response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSortChangeAsc = (field) => {
    if (field) {
      setSortFieldAsc(field) // Set the ascending sort field
      setSortFieldDesc('') // Clear the descending sort field
      fetchData(1, 10, searchTerm, field, 'asc') // Fetch data with ascending sort
    } else {
      setSortFieldAsc('') // Reset if no field is selected
    }
  }

  const handleSortChangeDesc = (field) => {
    if (field) {
      setSortFieldDesc(field) // Set the descending sort field
      setSortFieldAsc('') // Clear the ascending sort field
      fetchData(1, 10, searchTerm, field, 'desc') // Fetch data with descending sort
    } else {
      setSortFieldDesc('') // Reset if no field is selected
    }
  }

  const handleSortChange = (field, order) => {
    if (order === 'asc') {
      handleSortChangeAsc(field)
    } else {
      handleSortChangeDesc(field)
    }
  }

  const onDateChange = (dates) => {
    const [start, end] = dates

    // Ensure both start and end dates are selected
    if (start && end) {
      // Format start and end dates to 'YYYY-MM-DD'
      const formattedStartDate = start.toLocaleDateString('en-CA')
      const formattedEndDate = end.toLocaleDateString('en-CA')
      setMinAge(formattedStartDate)
      setMaxAge(formattedEndDate)

      // Close picker and fetch data with date range
      setIsDatePickerOpen(false)
      fetchData(1, 10, '', '', formattedStartDate, formattedEndDate)
    }
  }

  const toggleDatePicker = () => {
    setIsDatePickerOpen((prev) => !prev)
  }

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term) // Update search term
    fetchData(1, 10, term) // Fetch data based on current input
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page, limit)
    }
  }

  const getPagesToShow = () => {
    const pages = []

    if (totalPages <= 3) {
      // If there are 3 or fewer pages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show current page, and one before and one after
      if (currentPage > 1) pages.push(currentPage - 1)
      pages.push(currentPage)
      if (currentPage < totalPages) pages.push(currentPage + 1)

      // Ensure we don't exceed the total number of pages
      pages.forEach((page) => {
        if (page < 1) pages.push(1)
        if (page > totalPages) pages.push(totalPages)
      })
    }

    return Array.from(new Set(pages)).sort((a, b) => a - b) // Remove duplicates and sort
  }

  const pagesToShow = getPagesToShow()

  const togglePopup = (e) => {
    e.preventDefault()
    setIsPopupOpen(!isPopupOpen)
    fetchData()
  }

  const handleToggleStatus = async (matrimonialId) => {
    setTogglingStatus(matrimonialId) // Indicate which user status is being toggled
    try {
      // Toggle user status
      await axiosInstance.put(`${backendUrl}/apis/togglematrimonialstatus/${matrimonialId}`)

      await fetchData(currentPage, limit)
    } catch (error) {
      console.error(
        'Error toggling user status:',
        error.response ? error.response.data : error.message,
      )
    } finally {
      setTogglingStatus(null) // Reset toggling status
    }
  }

  // Handle file upload
  const handleUploadCSV = async (e) => {
    e.preventDefault()
    setIsPopupOpen(!isPopupOpen)
    if (!file) {
      alert('No file chosen')
      return
    }

    const formData = new FormData()
    formData.append('csvFile', file) // Key should match the server-side key

    try {
      const response = await axiosInstance.post(
        `${backendUrl}/apis/addmatrimonialsfromcsv`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      // Handle successful response
      console.log('Upload successful:', response.data) // For debugging
      alert('File uploaded successfully.')
      // setShowModal(false)
      fetchData()
    } catch (error) {
      // Handle errors
      console.error('Error uploading file:', error.response ? error.response.data : error.message)
      alert('Failed to upload file.')
    } finally {
      setUploading(false) // Reset uploading status after processing
    }
  }

  const handleFileChange = (matrimonial) => {
    setFile(matrimonial.target.files[0])
  }

  const handleEdit = async (id) => {
    console.log(`Edit matrimonialprofile with ID: ${id}`)
    setEditMode(true) // Set edit mode to true
    try {
      const response = await axiosInstance.get(
        `${backendUrl}/apis/matrimonialdetails?matrimonialId=${id}`,
      )
      const matrimonialData = response.data.matrimonialProfile
      console.log('DATA: ', matrimonialData)

      setNewMatrimonial({
        matrimonialId: matrimonialData.matrimonialId, // Include id for updating
        firstName: matrimonialData.firstName,
        middleName: matrimonialData.middleName,
        age: calculateAge(matrimonialData.dateOfBirth),
        lastName: matrimonialData.lastName,
        dateOfBirth: matrimonialData.dateOfBirth,
        contactNumber: matrimonialData.contactNumber,
        profilePic: matrimonialData.profilePic,
        biodata: matrimonialData.biodata,
        status: matrimonialData.status,
      })
      setShowForm(true) // Open the form for editing
    } catch (error) {
      console.error('Error fetching matrimonial details:', error)
      alert('Error fetching matrimonial details. Please try again later.')
    }
  }

  const handleDelete = async (id) => {
    const userConfirmed = window.confirm(
      'Are you sure you want to delete this matrimonial profile?',
    )

    if (!userConfirmed) {
      return // Exit the function if the user cancels the deletion
    }

    try {
      const response = await axiosInstance.put(`${backendUrl}/apis/deletematrimonial/${id}`)
      if (response.status === 200) {
        setmatrimonialProfiles((prevProfiles) =>
          prevProfiles.filter((matrimonial) => matrimonial.matrimonialId !== id),
        )
      } else {
        console.error('Failed to delete matrimonial profile:', response)
        alert('Failed to delete matrimonial profile. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting matrimonial profile:', error)
      alert('Error deleting matrimonial profile. Please try again.')
    }
  }

  const handleAddMatrimonial = () => {
    setShowForm(!showForm)
    setNewMatrimonial({
      matrimonialId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      contactNumber: '',
      dateOfBirth: '',
      age: '',
      profilePic: '',
      biodata: '',
      status: '',
    })
    setEditMode(false)
  }

  const handleInputChange = async (e) => {
    const { name, value, type, files } = e.target

    setNewMatrimonial((prevProfile) => {
      const updatedProfile = { ...prevProfile }

      // Handle file inputs
      if (type === 'file') {
        if (files && files.length > 0) {
          updatedProfile[name] = files[0] // Store the file (photo or PDF)
        } else {
          updatedProfile[name] = prevProfile[name] // Retain previous file (photo or PDF)
        }
      } else {
        // Handle other input types (e.g., text, date)
        updatedProfile[name] = value

        // Calculate age if the date of birth is changed
        if (name === 'dateOfBirth') {
          updatedProfile.age = calculateAge(value)
          console.log('Updated age:', updatedProfile.age)
        }
      }

      return updatedProfile
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submit handler called')

    // Prepare form data
    const formData = new FormData()
    console.log('newMatrimonial before FormData append:', newMatrimonial)

    Object.keys(newMatrimonial).forEach((key) => {
      // Check if the value is not undefined or null
      if (newMatrimonial[key] !== undefined && newMatrimonial[key] !== null) {
        console.log(`Key: ${key}, Value: ${newMatrimonial[key]}`)
        formData.append(key, newMatrimonial[key])
      } else {
        console.warn(`${key} is empty or undefined`)
      }
    })

    // Log FormData entries
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`)
    }

    console.log('Age in newMatrimonial:', newMatrimonial.age)

    try {
      let response

      if (editMode) {
        console.log('Updating matrimonial profile...')
        // Update announcement
        response = await axiosInstance.put(
          `${backendUrl}/apis/editmatrimonial/${newMatrimonial.matrimonialId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
          },
        )
      } else {
        // console.log(formData)
        console.log('Adding new matrimonial...')
        // Add new announcement
        response = await axiosInstance.post(`${backendUrl}/apis/addmatrimonial`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        })
      }

      console.log(editMode ? 'Edit Response:' : 'Add Response:', response)

      if (response.status === 200 || response.status === 201) {
        alert(editMode ? 'Matrimonial updated successfully' : 'Matrimonial added successfully')

        // Construct the announcement object from the response
        const updatedMatrimonial = {
          matrimonialId: response.data.matrimonialId, // Assuming this is returned from the API
          ...newMatrimonial,
        }

        console.log('Updated Matrimonial:', updatedMatrimonial) // Log updatedAnnouncement to ensure it’s constructed correctly

        setmatrimonialProfiles((prevMatrimonials) =>
          editMode
            ? prevMatrimonials.map((matrimonial) =>
                matrimonial.matrimonialId === updatedMatrimonial.matrimonialId
                  ? updatedMatrimonial
                  : matrimonial,
              )
            : [...prevMatrimonials, updatedMatrimonial],
        )
      } else {
        alert(editMode ? 'Error updating matrimonial' : 'Error adding matrimonial')
      }

      // Reset form after successful submission
      setNewMatrimonial({
        matrimonialId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        contactNumber: '',
        dateOfBirth: '',
        age: '',
        profilePic: '',
        biodata: '',
        status: '',
      })
      setShowForm(false)
      setEditMode(false) // Reset edit mode
      fetchData() // Refetch data to reflect changes
    } catch (error) {
      console.error('Error submitting matrimonial:', error)
      if (error.response) {
        alert(`Error: ${error.response.data.error || 'Server Error'}`)
      } else if (error.request) {
        alert('No response received from server. Please try again later.')
      } else {
        alert(`Error: ${error.message}`)
      }
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>
              {showForm ? (editMode ? 'Edit Matrimonial' : 'Add Matrimonial') : 'Matrimonial List'}
            </strong>
            <div className="d-flex align-items-center">
              {/* Search Icon and Input Container */}
              {!showForm && (
                <>
                  <div style={{ position: 'relative', maxWidth: '200px', marginRight: '11px' }}>
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888',
                        pointerEvents: 'none', // Prevents icon from blocking input clicks
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      onChange={handleSearch}
                      style={{
                        paddingLeft: '30px', // Space for the icon
                        width: '100%',
                        height: '35px',
                      }}
                    />
                  </div>
                  {/* Sorting Dropdowns */}
                  <div style={{ marginRight: '10px' }}>
                    <select
                      value={sortFieldAsc}
                      onChange={(e) => handleSortChange(e.target.value, 'asc')}
                      style={{ height: '35px', padding: '5px' }}
                    >
                      <option value="">Sort Ascending</option>
                      <option value="firstName">Name</option>
                      <option value="contactNumber">Contact Number</option>
                      <option value="dateOfBirth">Date of Birth</option>
                    </select>
                  </div>
                  <div style={{ paddingRight: '10px' }}>
                    <select
                      value={sortFieldDesc}
                      onChange={(e) => handleSortChange(e.target.value, 'desc')}
                      style={{ height: '35px', padding: '5px' }}
                    >
                      <option value="">Sort Descending</option>
                      <option value="firstName">Name</option>
                      <option value="contactNumber">Contact Number</option>
                      <option value="dateOfBirth">Date of Birth</option>
                    </select>
                  </div>
                  {/* Date Filter */}
                  {/* Calendar Icon to Open Date Picker */}
                  {/* <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#007bff',
                        paddingRight: '10px',
                      }}
                      onClick={toggleDatePicker} // Toggle date picker on icon click
                    /> */}

                  {/* DatePicker Dropdown */}
                  {/* {isDatePickerOpen && (
                      <div style={{ position: 'absolute', top: '30px', zIndex: 1000 }}>
                        <DatePicker
                          selected={minAge}
                          onChange={onDateChange}
                          startDate={minAge}
                          endDate={maxAge}
                          selectsRange
                          inline // Show calendar inline below the icon
                        />
                      </div>
                    )}
                  </div> */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      placeholder="Min Age"
                      value={minAge !== null ? minAge : ''} // Set to empty string if null
                      onChange={(e) => setMinAge(e.target.value !== '' ? e.target.value : '')} // Handle empty input
                      style={{
                        width: '80px', // Width of the input box
                        height: '35px', // Height of the input box
                        fontSize: '16px', // Font size
                        textAlign: 'center', // Center text
                        border: '1px solid black', // Border style
                        // borderRadius: '4px', // Rounded corners
                        marginRight: '5px', // Spacing between inputs
                      }}
                      min="0"
                      max="99"
                    />
                    <input
                      type="number"
                      placeholder="Max Age"
                      value={maxAge !== null ? maxAge : ''} // Set to empty string if null
                      onChange={(e) => setMaxAge(e.target.value !== '' ? e.target.value : '')} // Handle empty input
                      style={{
                        width: '82px', // Width of the input box
                        height: '35px', // Height of the input box
                        fontSize: '16px', // Font size
                        textAlign: 'center', // Center text
                        border: '1px solid black', // Border style
                        // borderRadius: '4px', // Rounded corners
                      }}
                      min="0"
                      max="99"
                    />
                    <button
                      onClick={() => fetchData(1, 10, '', '', '', minAge, maxAge)}
                      style={{
                        height: '36px', // Button height
                        padding: '0 10px', // Horizontal padding
                        fontSize: '16px', // Font size
                        backgroundColor: '#5856d6', // Button background color
                        color: '#fff', // Button text color
                        border: 'none', // No border
                        borderRadius: '4px', // Rounded corners
                        cursor: 'pointer', // Pointer cursor on hover
                        marginRight: '5px',
                      }}
                    >
                      Search
                    </button>
                  </div>
                </>
              )}
              {!showForm && (
                <>
                  <CButton color="primary" onClick={handleAddMatrimonial}>
                    Add Matrimonial
                  </CButton>
                </>
              )}
            </div>
          </CCardHeader>
          {isPopupOpen && (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '500px',
                height: '300px',
                backgroundColor: '#fff',
                boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
                zIndex: 1050,
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <CCard>
                <CCardHeader>Upload CSV File</CCardHeader>
                <CCardBody>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'block', marginBottom: '15px' }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '100px',
                    }}
                  >
                    <CButton
                      color="primary"
                      onClick={handleUploadCSV}
                      style={{
                        width: '49%', // Adjusts button width to fit side by side
                      }}
                    >
                      Upload
                    </CButton>
                    <CButton
                      color="secondary"
                      onClick={togglePopup}
                      style={{
                        width: '49%', // Adjusts button width to fit side by side
                      }}
                    >
                      Close
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </div>
          )}
          <CCardBody>
            {showForm && (
              <CForm className="row g-3 mb-4" onSubmit={handleFormSubmit}>
                <CCol md={6}>
                  <CFormInput
                    type="text"
                    id="firstName"
                    name="firstName"
                    label={
                      <span>
                        First Name <span className="text-danger">*</span>
                      </span>
                    }
                    value={newMatrimonial.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="text"
                    id="middleName"
                    name="middleName"
                    label="Middle Name"
                    value={newMatrimonial.middleName}
                    onChange={handleInputChange}
                    required
                  ></CFormInput>
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="text"
                    id="lastName"
                    name="lastName"
                    label={
                      <span>
                        Last Name <span className="text-danger">*</span>
                      </span>
                    }
                    value={newMatrimonial.lastName}
                    onChange={handleInputChange}
                    required
                  ></CFormInput>
                </CCol>
                <CCol md="6">
                  <label htmlFor="contactNumber" className="form-label">
                    Contact Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="contactNumber"
                    name="contactNumber"
                    value={newMatrimonial.contactNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    label={
                      <span>
                        Date Of Birth <span className="text-danger">*</span>
                      </span>
                    }
                    value={formatDate(newMatrimonial.dateOfBirth) || ''}
                    onChange={handleInputChange}
                    // min={getMinDate()}
                    max={getMaxDateOfBirth()}
                    required
                  />
                </CCol>
                <CCol md="6">
                  <label htmlFor="age" className="form-label">
                    Age
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="age"
                    name="age"
                    value={newMatrimonial.age}
                    onChange={handleInputChange}
                    readOnly
                  />
                </CCol>
                <CCol md="6">
                  <label htmlFor="photo" className="form-label">
                    ProfilePic <span className="text-danger">*</span>
                  </label>
                  {editMode && newMatrimonial.profilePic && (
                    <div className="mb-3">
                      <img
                        src={`http://157.173.221.111:8080/communityapp.com/backend/${newMatrimonial.profilePic}`}
                        alt="User Photo"
                        style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '5px' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    id="profilePic"
                    name="profilePic"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputPDF">
                    Biodata <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="file"
                    id="biodata"
                    name="biodata"
                    onChange={handleInputChange}
                    // required
                    accept=".pdf"
                  />
                </CCol>
                <CCol md="12" className="d-flex justify-content-end">
                  <CButton
                    type="submit"
                    color="primary"
                    className="me-2"
                    onClick={() => console.log('Submit button clicked')}
                  >
                    Submit
                  </CButton>
                  <CButton type="button" color="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </CButton>
                </CCol>
              </CForm>
            )}
            {!showForm && (
              <>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Photo</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">ContactNumber</CTableHeaderCell>
                      <CTableHeaderCell scope="col">BirthDate</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {matrimonialProfiles.map((matrimonial, index) => (
                      <React.Fragment key={matrimonial.matrimonialId}>
                        <CTableRow>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>
                            {matrimonial.profilePic ? (
                              <img
                                src={
                                  `http://157.173.221.111:8080/communityapp.com/backend/${matrimonial.profilePic}` ||
                                  ''
                                }
                                alt="photo"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover',
                                  borderRadius: '50%',
                                }}
                              />
                            ) : (
                              'No photo'
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <span
                              style={{ cursor: 'pointer', color: 'blue' }}
                              onClick={() => handleMoreDetails(matrimonial.matrimonialId)}
                            >
                              {`${matrimonial.firstName} ${matrimonial.lastName}`}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>{matrimonial.contactNumber}</CTableDataCell>
                          <CTableDataCell>
                            {formatDateForDisplay(matrimonial.dateOfBirth)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CButton
                                color="primary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleEdit(matrimonial.matrimonialId)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => handleDelete(matrimonial.matrimonialId)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                              <CButton
                                // color="secondary"
                                size="sm"
                                className="ms-2"
                                onClick={() => handleToggleStatus(matrimonial.matrimonialId)}
                                disabled={togglingStatus === matrimonial.matrimonialId}
                              >
                                <IoToggle
                                  size={24} // Set the size of the icon
                                  style={{
                                    color: matrimonial.status == '1' ? 'green' : 'grey',
                                    transform:
                                      matrimonial.status == '1' ? 'rotate(0deg)' : 'rotate(180deg)',
                                    // transition: 'transform 0.1s',
                                  }}
                                />
                              </CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableDataCell colSpan="9">
                            <CCollapse
                              visible={selectedMatrimonialId === matrimonial.matrimonialId}
                            >
                              <CCard>
                                <CCardBody>
                                  <CRow className="mb-3">
                                    <CCol md="6">
                                      <strong>First Name:</strong> {matrimonial.firstName}
                                    </CCol>
                                    <CCol md="6">
                                      <strong>Middle Name:</strong> {matrimonial.middleName}
                                    </CCol>
                                  </CRow>

                                  <CRow className="mb-3">
                                    <CCol md="6">
                                      <strong>Last Name:</strong> {matrimonial.lastName}
                                    </CCol>
                                    <CCol md="6">
                                      <strong>Birth Date:</strong>{' '}
                                      {formatDateForDisplay(matrimonial.dateOfBirth)}
                                    </CCol>
                                  </CRow>

                                  <CRow className="mb-3">
                                    <CCol md="12">
                                      <strong>Contact Number:</strong> {matrimonial.contactNumber}
                                    </CCol>
                                  </CRow>

                                  <CRow className="mb-3">
                                    <CCol md="12">
                                      <strong>Profile Picture:</strong>
                                      {matrimonial.profilePic && (
                                        <div style={{ marginTop: '10px' }}>
                                          <img
                                            src={`http://157.173.221.111:8080/communityapp.com/backend/${matrimonial.profilePic}`}
                                            alt="Profile Pic"
                                            style={{
                                              maxWidth: '100px',
                                              maxHeight: '100px',
                                              marginTop: '10px',
                                            }}
                                          />
                                        </div>
                                      )}
                                    </CCol>
                                  </CRow>

                                  <CRow className="mb-3">
                                    <CCol md="12">
                                      <strong>BioData:</strong>&nbsp;&nbsp;
                                      <a
                                        href={`http://157.173.221.111:8080/${matrimonial.biodata}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Download PDF
                                      </a>
                                    </CCol>
                                  </CRow>
                                </CCardBody>
                              </CCard>
                            </CCollapse>
                          </CTableDataCell>
                        </CTableRow>
                      </React.Fragment>
                    ))}
                  </CTableBody>
                </CTable>
                <CPagination align="end" aria-label="Page navigation example">
                  <CPaginationItem
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }} // Pointer cursor for enabled
                  >
                    Previous
                  </CPaginationItem>
                  {pagesToShow.map((page) => (
                    <CPaginationItem
                      key={page}
                      onClick={() => handlePageChange(page)}
                      active={page === currentPage}
                      style={{ cursor: 'pointer' }} // Pointer cursor for all items
                    >
                      {page}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }} // Pointer cursor for enabled
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Matrimonials
