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
  CFormTextarea,
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
import { faCalendarAlt, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
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

const getMinDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0] // Format as YYYY-MM-DD
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [showForm, setShowForm] = useState(false)
  // const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [file, setFile] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)
  const [uploading, setUploading] = useState(false)
  const [date, setDate] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortFieldAsc, setSortFieldAsc] = useState('')
  const [sortFieldDesc, setSortFieldDesc] = useState('')
  const [newAnnouncement, setNewAnnouncement] = useState({
    announcementId: '',
    announcementTitle: '',
    announcementType: '',
    announcementDate: '',
    announcementDescription: '',
    status: '',
  })
  const backendUrl = getBackendURL()

  useEffect(() => {
    fetchData()
  }, [])

  const handleMoreDetails = (announcementId) => {
    // Toggle visibility of details
    setSelectedAnnouncementId(selectedAnnouncementId === announcementId ? null : announcementId)
  }
  const fetchData = async (
    page = 1,
    limit = 10,
    term = '',
    date = '',
    startDate = '',
    endDate = '',
    sortField = '',
    sortOrder = '',
  ) => {
    try {
      const response = await axiosInstance.get(`${backendUrl}/apis/announcements`, {
        params: {
          search: term,
          page: page,
          limit: limit,
          date: date || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortField: sortField || undefined,
          sortOrder: sortOrder || undefined,
        },
      })
      if (response.data && response.data.announcements) {
        setAnnouncements(response.data.announcements)
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
      fetchData(1, 10, searchTerm, '', '', '', field, 'asc') // Fetch data with ascending sort
    } else {
      setSortFieldAsc('') // Reset if no field is selected
    }
  }

  const handleSortChangeDesc = (field) => {
    if (field) {
      setSortFieldDesc(field) // Set the descending sort field
      setSortFieldAsc('') // Clear the ascending sort field
      fetchData(1, 10, searchTerm, '', '', '', field, 'desc') // Fetch data with descending sort,
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

    if (!end) {
      // Only `start` is selected, wait for `end` date before closing
      setStartDate(start)
      setEndDate(null)
      setDate(null)
    } else {
      // Both `start` and `end` dates are selected
      const formattedStartDate = start.toLocaleDateString('en-CA')
      const formattedEndDate = end.toLocaleDateString('en-CA')
      setDate(null)
      setStartDate(formattedStartDate)
      setEndDate(formattedEndDate)

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

  const handleToggleStatus = async (announcementId) => {
    setTogglingStatus(announcementId) // Indicate which user status is being toggled
    try {
      // Toggle user status
      await axiosInstance.put(`${backendUrl}/apis/toggleannouncementstatus/${announcementId}`)

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
        `${backendUrl}/apis/addannouncementsfromcsv`,
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

  const handleFileChange = (announcement) => {
    setFile(announcement.target.files[0])
  }

  const handleEdit = async (id) => {
    console.log(`Edit announcement with ID: ${id}`)
    setEditMode(true) // Set edit mode to true
    try {
      const response = await axiosInstance.get(
        `${backendUrl}/apis/announcementdetails?announcementId=${id}`,
      )
      const announcementData = response.data.announcement
      console.log('DATA: ', announcementData)

      setNewAnnouncement({
        announcementId: announcementData.announcementId, // Include id for updating
        announcementTitle: announcementData.announcementTitle,
        // Title: announcementData.announcementTitle,
        announcementType: announcementData.announcementType,
        // Type: announcementData.announcementType,
        announcementDate: announcementData.announcementDate,
        announcementDescription: announcementData.announcementDescription,
        status: announcementData.status,
        // photo: announcementData.photo,
      })
      setShowForm(true) // Open the form for editing
    } catch (error) {
      console.error('Error fetching announcement details:', error)
      alert('Error fetching announcement details. Please try again later.')
    }
  }

  const handleDelete = async (id) => {
    const userConfirmed = window.confirm('Are you sure you want to delete this announcement?')

    if (!userConfirmed) {
      return // Exit the function if the user cancels the deletion
    }

    try {
      const response = await axiosInstance.put(`${backendUrl}/apis/deleteannouncement/${id}`)
      if (response.status === 200) {
        setAnnouncements(announcements.filter((announcement) => announcement.announcementId !== id))
      } else {
        console.error('Failed to delete announcement:', response)
        alert('Failed to delete announcement. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Error deleting announcement. Please try again.')
    }
  }

  const handleAddAnnouncement = () => {
    setShowForm(!showForm)
    setNewAnnouncement({
      announcementTitle: '',
      announcementType: '',
      announcementDate: '',
      announcementDescription: '',
      status: '',
    })
    setEditMode(false)
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setNewAnnouncement((prevState) => ({
      ...prevState,
      [id]: value,
    }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submit handler called')

    // Prepare form data
    const formData = new FormData()
    console.log('newAnnouncement before FormData append:', newAnnouncement)

    Object.keys(newAnnouncement).forEach((key) => {
      if (newAnnouncement[key]) {
        formData.append(key, newAnnouncement[key])
      } else {
        console.warn(`${key} is empty or undefined`)
      }
    })

    // Log FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`)
    }

    try {
      let response

      if (editMode) {
        console.log('Updating announcement...')
        // Update announcement
        response = await axiosInstance.put(
          `${backendUrl}/apis/editannouncement/${newAnnouncement.announcementId}`,
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
        console.log('Adding new announcement...')
        // Add new announcement
        response = await axiosInstance.post(`${backendUrl}/apis/addannouncement`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        })
      }

      console.log(editMode ? 'Edit Response:' : 'Add Response:', response)

      if (response.status === 200 || response.status === 201) {
        alert(editMode ? 'Announcement updated successfully' : 'Announcement added successfully')

        // Construct the announcement object from the response
        const updatedAnnouncement = {
          announcementId: response.data.announcementId, // Assuming this is returned from the API
          ...newAnnouncement,
        }

        console.log('Updated Announcement:', updatedAnnouncement) // Log updatedAnnouncement to ensure it’s constructed correctly

        setAnnouncements((prevAnnouncements) =>
          editMode
            ? prevAnnouncements.map((announcement) =>
                announcement.announcementId === updatedAnnouncement.announcementId
                  ? updatedAnnouncement
                  : announcement,
              )
            : [...prevAnnouncements, updatedAnnouncement],
        )
      } else {
        alert(editMode ? 'Error updating announcement' : 'Error adding announcement')
      }

      // Reset form after successful submission
      setNewAnnouncement({
        announcementTitle: '',
        announcementType: '',
        announcementDate: '',
        announcementDescription: '',
        status: '',
      })
      setShowForm(false)
      setEditMode(false) // Reset edit mode
      fetchData() // Refetch data to reflect changes
    } catch (error) {
      console.error('Error submitting announcement:', error)
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
              {showForm
                ? editMode
                  ? 'Edit Announcement'
                  : 'Add Announcement'
                : 'Announcement List'}
            </strong>
            <div className="d-flex align-items-center">
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
                      <option value="announcementTitle">Title</option>
                      <option value="announcementType">Type</option>
                      <option value="announcementDate">Date</option>
                      <option value="announcementDescription">Description</option>
                    </select>
                  </div>
                  <div style={{ paddingRight: '10px' }}>
                    <select
                      value={sortFieldDesc}
                      onChange={(e) => handleSortChange(e.target.value, 'desc')}
                      style={{ height: '35px', padding: '5px' }}
                    >
                      <option value="">Sort Descending</option>
                      <option value="announcementTitle">Title</option>
                      <option value="announcementType">Type</option>
                      <option value="announcementDate">Date</option>
                      <option value="announcementDescription">Description</option>
                    </select>
                  </div>
                  {/* Date Filter */}
                  {/* Calendar Icon to Open Date Picker */}
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#007bff',
                        paddingRight: '10px',
                      }}
                      onClick={toggleDatePicker} // Toggle date picker on icon click
                    />

                    {/* DatePicker Dropdown */}
                    {isDatePickerOpen && (
                      <div style={{ position: 'absolute', top: '30px', zIndex: 1000 }}>
                        <DatePicker
                          selected={startDate}
                          onChange={onDateChange}
                          startDate={startDate}
                          endDate={endDate}
                          selectsRange
                          inline // Show calendar inline below the icon
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
              {!showForm && (
                <>
                  <CButton color="primary" onClick={handleAddAnnouncement}>
                    Add Announcement
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
                    id="announcementTitle"
                    name="announcementTitle"
                    // label="Announcement Title"
                    label={
                      <span>
                        Announcement Title <span className="text-danger">*</span>
                      </span>
                    }
                    value={newAnnouncement.announcementTitle || ''}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="announcementType"
                    name="announcementType"
                    // label="Announcement Type"
                    label={
                      <span>
                        Announcement Type <span className="text-danger">*</span>
                      </span>
                    }
                    value={newAnnouncement.announcementType || ''}
                    onChange={handleInputChange}
                    required
                  ></CFormInput>
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="date"
                    name="announcementDate"
                    id="announcementDate"
                    label={
                      <span>
                        Date <span className="text-danger">*</span>
                      </span>
                    }
                    value={formatDate(newAnnouncement.announcementDate) || ''}
                    min={getMinDate()}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormTextarea
                    id="announcementDescription"
                    name="announcementDescription"
                    label={
                      <span>
                        Description <span className="text-danger">*</span>
                      </span>
                    }
                    value={newAnnouncement.announcementDescription || ''}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </CCol>
                <CCol md="12" className="d-flex justify-content-end">
                  <CButton
                    type="submit"
                    color="primary"
                    className="me-2"
                    onClick={() => console.log('Submit button clicked')}
                  >
                    {/* {editMode ? 'Update Event' : 'Add Event'} */}Submit
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
                      <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                      {/* <CTableHeaderCell scope="col">Time</CTableHeaderCell> */}
                      <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {announcements.map((announcement, index) => (
                      <React.Fragment key={announcement.announcementId}>
                        <CTableRow>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>
                            <span
                              style={{ cursor: 'pointer', color: 'blue' }}
                              onClick={() => handleMoreDetails(announcement.announcementId)}
                            >
                              {announcement.announcementTitle}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>{announcement.announcementType}</CTableDataCell>
                          <CTableDataCell>
                            {formatDateForDisplay(announcement.announcementDate)}
                          </CTableDataCell>
                          {/* <CTableDataCell>
                            {announcement.announcementDescription.length > 33
                              ? `${announcement.announcementDescription.slice(0, 33)}...`
                              : announcement.announcementDescription}
                          </CTableDataCell> */}
                          <CTableDataCell>
                            {announcement.announcementDescription &&
                            announcement.announcementDescription.length > 33
                              ? `${announcement.announcementDescription.slice(0, 33)}...`
                              : announcement.announcementDescription || 'No Description Available'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(announcement.announcementId)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(announcement.announcementId)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                            <CButton
                              // color="secondary"
                              size="sm"
                              className="ms-2"
                              onClick={() => handleToggleStatus(announcement.announcementId)}
                              disabled={togglingStatus === announcement.announcementId}
                            >
                              <IoToggle
                                size={24} // Set the size of the icon
                                style={{
                                  color: announcement.status == '1' ? 'green' : 'grey',
                                  transform:
                                    announcement.status == '1' ? 'rotate(0deg)' : 'rotate(180deg)',
                                  // transition: 'transform 0.1s',
                                }}
                              />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableDataCell colSpan="9">
                            <CCollapse
                              visible={selectedAnnouncementId === announcement.announcementId}
                            >
                              <CCard>
                                <CCardBody>
                                  <CRow>
                                    <CCol md="12">
                                      <strong>Title:</strong> {announcement.announcementTitle}
                                    </CCol>
                                  </CRow>
                                  <CRow className="mt-2">
                                    <CCol md="6">
                                      <strong>Type:</strong> {announcement.announcementType}
                                    </CCol>
                                    <CCol md="6">
                                      <strong>Date:</strong>{' '}
                                      {formatDateForDisplay(announcement.announcementDate)}
                                    </CCol>
                                  </CRow>
                                  <CRow className="mt-2">
                                    <CCol md="12">
                                      <strong>Description:</strong>{' '}
                                      {announcement.announcementDescription}
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

export default Announcements
