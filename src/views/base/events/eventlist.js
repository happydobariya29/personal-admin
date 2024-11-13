import { cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { getBackendURL } from '../../../util'

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

const Events = () => {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: '',
    dateTime: '',
    description: '',
    status: '',
    photo: '',
  })
  const backendUrl = getBackendURL()

  useEffect(() => {
    fetchData()
  }, [])

  const handleMoreDetails = (eventId) => {
    setSelectedEventId(selectedEventId === eventId ? null : eventId)
  }

  const fetchData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/apis/events`)
      if (response.data && response.data.events) {
        setEvents(response.data.events)
      } else {
        console.error('Unexpected response structure:', response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleEdit = (id) => {
    const selectedEvent = events.find((event) => event.eventId === id)
    if (selectedEvent) {
      setNewEvent({
        name: selectedEvent.name,
        type: selectedEvent.type,
        dateTime: selectedEvent.dateTime,
        description: selectedEvent.description,
        status: selectedEvent.status,
        photo: selectedEvent.photo,
      })
      setShowForm(true)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/apis/event/${id}`)
      const updatedEvents = events.filter((event) => event.eventId !== id)
      setEvents(updatedEvents)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleAddEvent = () => {
    setShowForm(!showForm)
    setNewEvent({
      name: '',
      type: '',
      dateTime: '',
      description: '',
      status: '',
      photo: '',
    })
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setNewEvent((prevState) => ({
      ...prevState,
      [id]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewEvent((prevState) => ({
        ...prevState,
        photo: file,
      }))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', newEvent.name)
    formData.append('type', newEvent.type)
    formData.append('dateTime', newEvent.dateTime)
    formData.append('description', newEvent.description)
    formData.append('status', newEvent.status)
    if (newEvent.photo) {
      formData.append('photo', newEvent.photo)
    }

    try {
      const response = await axios.post(`${backendUrl}/apis/addevent`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      })

      if (response.status === 201) {
        alert('Event added successfully')
        const addedEvent = {
          eventId: response.data.eventId,
          ...newEvent,
        }
        setEvents([...events, addedEvent])
        setNewEvent({
          name: '',
          type: '',
          dateTime: '',
          description: '',
          status: '',
          photo: '',
        })
        setShowForm(false)
      } else {
        alert('Error adding event')
      }
    } catch (error) {
      console.error('Error adding event:', error)
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
            <strong>Manage Events</strong>
            <CButton color="primary" onClick={handleAddEvent}>
              {showForm ? 'Close Form' : 'Add Event'}
            </CButton>
          </CCardHeader>
          <CCardBody>
            {showForm && (
              <CForm className="row g-3 mb-4" onSubmit={handleFormSubmit}>
                <CCol md={6}>
                  <CFormInput
                    id="name"
                    label="Event Name"
                    value={newEvent.name}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormSelect
                    id="type"
                    label="Event Type"
                    value={newEvent.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option>Select type</option>
                    <option>Meeting</option>
                    <option>Conference</option>
                    <option>Webinar</option>
                    <option>Other</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="datetime-local"
                    id="dateTime"
                    label="Date & Time"
                    value={newEvent.dateTime}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="file"
                    id="photo"
                    label="Event Photo"
                    onChange={handleFileChange}
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormTextarea
                    id="description"
                    label="Event Description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </CCol>
                <CCol xs={12} className="text-end">
                  <CButton color="primary" type="submit">
                    Make Event
                  </CButton>
                </CCol>
              </CForm>
            )}
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Time</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Photo</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {events.map((event) => (
                  <React.Fragment key={event.eventId}>
                    <CTableRow>
                      <CTableDataCell>{event.eventId}</CTableDataCell>
                      <CTableDataCell>
                        <span
                          style={{ cursor: 'pointer', color: 'blue' }}
                          onClick={() => handleMoreDetails(event.eventId)}
                        >
                          {event.name}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>{event.type}</CTableDataCell>
                      <CTableDataCell>{formatDateForDisplay(event.dateTime)}</CTableDataCell>
                      <CTableDataCell>{formatTimeForDisplay(event.dateTime)}</CTableDataCell>
                      <CTableDataCell>
                        {selectedEventId === event.eventId && event.description}
                      </CTableDataCell>
                      <CTableDataCell>
                        {event.photo && (
                          <img
                            src={event.photo}
                            alt={event.name}
                            style={{ width: '100px', height: 'auto' }}
                          />
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{event.status}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(event.eventId)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          className="ms-2"
                          onClick={() => handleDelete(event.eventId)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  </React.Fragment>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Events
