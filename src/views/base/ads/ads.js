// export default Ads
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
import React, { useEffect, useState } from 'react'
import { IoToggle } from 'react-icons/io5'
import { getBackendURL } from '../../../util'
import axiosInstance from '../services/axiosInstance'

const Ads = () => {
  const [ads, setAds] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedAdsId, setSelectedAdsId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [file, setFile] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [sortFieldAsc, setSortFieldAsc] = useState('')
  const [sortFieldDesc, setSortFieldDesc] = useState('')
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [newAds, setNewAds] = useState({
    adsId: '',
    title: '',
    type: '',
    status: '',
    photo: '',
  })
  const backendUrl = getBackendURL()

  useEffect(() => {
    fetchData()
  }, [])

  const handleMoreDetails = (adsId) => {
    setSelectedAdsId(selectedAdsId === adsId ? null : adsId)
  }

  const fetchData = async (page = 1, limit = 10, term = '', sortField = '', sortOrder = '') => {
    try {
      // const token = localStorage.getItem('token')
      const response = await axiosInstance.get(`${backendUrl}/apis/ads`, {
        params: {
          search: term,
          page: page,
          limit: limit,
          sortField, // Sorting field
          sortOrder, // Sorting order
        },
      })
      if (response.data && response.data.ads) {
        setAds(response.data.ads)
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
  const handleToggleStatus = async (adsId) => {
    setTogglingStatus(adsId) // Indicate which user status is being toggled
    try {
      const token = localStorage.getItem('token')
      // Toggle user status
      await axiosInstance.put(`${backendUrl}/apis/toggleadstatus/${adsId}`)

      await fetchData(currentPage, limit)
    } catch (error) {
      console.error(
        'Error toggling ads status:',
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
      const token = localStorage.getItem('token')
      const response = await axiosInstance.post(`${backendUrl}/apis/addadsfromcsv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

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
  const handleEdit = async (id) => {
    console.log(`Edit ad with ID: ${id}`)
    setEditMode(true) // Set edit mode to true
    try {
      const response = await axiosInstance.get(`${backendUrl}/apis/adsdetails?adsId=${id}`)
      const adsData = response.data.ad
      console.log('DATA: ', adsData)

      setNewAds({
        adsId: adsData.adsId, // Include
        title: adsData.title,
        type: adsData.type,
        status: adsData.status,
        photo: adsData.photo,
      })
      setShowForm(true) // Open the form for editing
    } catch (error) {
      console.error('Error fetching ads details:', error)
      alert('Error fetching ads details. Please try again later.')
    }
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleDelete = async (id) => {
    const userConfirmed = window.confirm('Are you sure you want to delete this ads?')

    if (!userConfirmed) {
      return // Exit the function if the user cancels the deletion
    }

    try {
      const response = await axiosInstance.put(`${backendUrl}/apis/deletead/${id}`)
      if (response.status === 200) {
        setAds(ads.filter((ads) => ads.adsId !== id))
      } else {
        console.error('Failed to delete ads:', response)
        alert('Failed to delete ads Please try again.')
      }
    } catch (error) {
      console.error('Error deleting ads:', error)
      alert('Error deleting ads Please try again.')
    }
  }

  const handleAddAds = () => {
    setShowForm(!showForm)
    setNewAds({
      adsId: '',
      title: '',
      type: '',
      status: '',
      photo: '',
    })
    setEditMode(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target

    setNewAds((prevAds) => {
      const updatedAds = { ...prevAds }

      // Handle file inputs
      if (type === 'file') {
        // Only update the photo if a new file is selected
        if (files && files.length > 0) {
          updatedAds[name] = files[0]
        } else {
          // If no new file selected, retain the previous photo
          updatedAds[name] = prevAds.photo // Retain previous photo
        }
      } else {
        // Handle other input types (e.g., text, date)
        updatedAds[name] = value
      }

      return updatedAds
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submit handler called')

    // Prepare form data
    const formData = new FormData()
    console.log('newAds before FormData append:', newAds)

    Object.keys(newAds).forEach((key) => {
      if (newAds[key]) {
        formData.append(key, newAds[key])
      } else {
        console.warn(`${key} is empty or undefined`)
      }
    })

    // Debugging: Print FormData entries
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }
    formData.forEach((value, key) => console.log(key, value))
    try {
      let response

      if (editMode) {
        console.log('Updating ads...')
        // Update Ad
        response = await axiosInstance.put(`${backendUrl}/apis/editads/${newAds.adsId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        })
      } else {
        // console.log(formData)
        console.log('Adding new ads...')
        // Add new Ad
        response = await axiosInstance.post(`${backendUrl}/apis/addads`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        })
      }

      console.log(editMode ? 'Edit Response:' : 'Add Response:', response)

      if (response.status === 200 || response.status === 201) {
        alert(editMode ? 'Ads updated successfully' : 'Ads added successfully')

        // Construct the Ad object from the response
        const updatedAds = {
          adsId: response.data.adsId, // Assuming this is returned from the API
          ...newAds,
          photo: newAds.photo ? newAds.photo : '', // Ensure photo exists
        }

        console.log('Updated Ads:', updatedAds) // Log updateAds to ensure it’s constructed correctly

        setAds((prevAds) =>
          editMode
            ? prevAds.map((ads) => (ads.adsId === updatedAds.adsId ? updatedAds : ads))
            : [...prevAds, updatedAds],
        )
      } else {
        alert(editMode ? 'Error updating ads' : 'Error adding ads')
      }

      // Reset form after successful submission
      setNewAds({
        adsId: '',
        title: '',
        type: '',
        status: '',
        photo: '',
      })
      // setFormErrors({})
      setShowForm(false)
      setEditMode(false) // Reset edit mode
      fetchData() // Refetch data to reflect changes
    } catch (error) {
      console.error('Error submitting ads:', error)
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
            <strong>{showForm ? (editMode ? 'Edit Ads' : 'Add Ads') : 'Ads List'}</strong>
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
                      <option value="title">Title</option>
                      <option value="type">Type</option>
                    </select>
                  </div>
                  <div style={{ paddingRight: '10px' }}>
                    <select
                      value={sortFieldDesc}
                      onChange={(e) => handleSortChange(e.target.value, 'desc')}
                      style={{ height: '35px', padding: '5px' }}
                    >
                      <option value="">Sort Descending</option>
                      <option value="title">Title</option>
                      <option value="type">Type</option>
                    </select>
                  </div>
                </>
              )}
              {!showForm && (
                <>
                  {/* <CButton color="primary" onClick={togglePopup} style={{ marginRight: '11px' }}>
                    Import
                  </CButton> */}
                  <CButton color="primary" onClick={handleAddAds}>
                    Add Ads
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
                    id="title"
                    name="title"
                    label={
                      <span>
                        Ad Title <span className="text-danger">*</span>
                      </span>
                    }
                    value={newAds.title}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="type"
                    name="type"
                    label={
                      <span>
                        Ad Type <span className="text-danger">*</span>
                      </span>
                    }
                    value={newAds.type}
                    onChange={handleInputChange}
                    required
                  ></CFormInput>
                </CCol>
                <CCol md="6">
                  <label htmlFor="photo" className="form-label">
                    Photo <span className="text-danger">*</span>
                  </label>
                  {editMode && newAds.photo && (
                    <div className="mb-3">
                      {console.log(newAds)}
                      <img
                        src={`http://157.173.221.111:8080/communityapp.com/backend/${newAds.photo}`}
                        alt="User Photo"
                        style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '5px' }}
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    className="form-control"
                    id="photo"
                    name="photo"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleInputChange}
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
                      <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {ads.map((ads, index) => (
                      <React.Fragment key={ads.adsId}>
                        <CTableRow>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>
                            <span
                              style={{ cursor: 'pointer', color: 'blue' }}
                              onClick={() => handleMoreDetails(ads.adsId)}
                            >
                              {ads.title}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>{ads.type}</CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CButton
                                color="primary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleEdit(ads.adsId)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => handleDelete(ads.adsId)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                              <CButton
                                // color="secondary"
                                size="sm"
                                className="ms-2"
                                onClick={() => handleToggleStatus(ads.adsId)}
                                disabled={togglingStatus === ads.adsId}
                              >
                                <IoToggle
                                  size={24} // Set the size of the icon
                                  style={{
                                    color: ads.status == '1' ? 'green' : 'grey',
                                    transform:
                                      ads.status == '1' ? 'rotate(0deg)' : 'rotate(180deg)',
                                    // transition: 'transform 0.1s',
                                  }}
                                />
                              </CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableDataCell colSpan="9">
                            <CCollapse visible={selectedAdsId === ads.adsId}>
                              <CCard>
                                <CCardBody>
                                  <CRow className="mt-2">
                                    <CCol md="6">
                                      <strong>Title:</strong> {ads.title}
                                    </CCol>
                                    <CCol md="6">
                                      <strong>Type:</strong> {ads.type}
                                    </CCol>
                                  </CRow>
                                  <CRow className="mt-2">
                                    <CCol md="12">
                                      <strong>Photo :</strong>{' '}
                                      {ads.photo && (
                                        <>
                                          <div>
                                            <img
                                              src={`http://157.173.221.111:8080/communityapp.com/backend/${ads.photo}`}
                                              alt="Ads Photo"
                                              style={{
                                                maxWidth: '100px',
                                                maxHeight: '100px',
                                                marginTop: '10px',
                                              }}
                                            />
                                          </div>
                                        </>
                                      )}
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
                  {pagesToShow.map((page, index) => (
                    <CPaginationItem
                      key={`${page}-${index}`}
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

export default Ads
