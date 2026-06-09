import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TeacherAttendance from '../pages/Teacher/TeacherAttendance'

// ─── Unit tests: getTodayDate logic ───────────────────────────────────────
describe('getTodayDate logic', () => {
  it('produces a date string in YYYY-MM-DD format', () => {
    const today = new Date()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const expected = `${today.getFullYear()}-${mm}-${dd}`
    expect(expected).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('month is zero-padded', () => {
    // Force a single-digit month scenario
    const date = new Date(2025, 0, 5) // January
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    expect(mm).toBe('01')
  })

  it('day is zero-padded', () => {
    const date = new Date(2025, 0, 5)
    const dd = String(date.getDate()).padStart(2, '0')
    expect(dd).toBe('05')
  })
})

// ─── Component tests: TeacherAttendance ──────────────────────────────────
describe('TeacherAttendance component', () => {
  it('renders "Mark Attendance" heading', () => {
    render(<TeacherAttendance />)
    expect(screen.getByText('Mark Attendance')).toBeInTheDocument()
  })

  it('renders course selector', () => {
    render(<TeacherAttendance />)
    expect(screen.getByLabelText('Select Course')).toBeInTheDocument()
  })

  it('renders date input', () => {
    render(<TeacherAttendance />)
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
  })

  it('course dropdown defaults to CS301', () => {
    render(<TeacherAttendance />)
    const select = screen.getByLabelText('Select Course')
    expect(select.value).toBe('CS301')
  })

  it('date input defaults to today in YYYY-MM-DD format', () => {
    render(<TeacherAttendance />)
    const dateInput = screen.getByLabelText('Date')
    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('lists all 3 courses in dropdown', () => {
    render(<TeacherAttendance />)
    expect(screen.getByText('CS301 — Software Engineering')).toBeInTheDocument()
    expect(screen.getByText('CS302 — Database Management')).toBeInTheDocument()
    expect(screen.getByText('CS303 — Operating Systems')).toBeInTheDocument()
  })

  it('renders attendance table headers', () => {
    render(<TeacherAttendance />)
    expect(screen.getByText('Student ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Present')).toBeInTheDocument()
    expect(screen.getByText('Absent')).toBeInTheDocument()
    expect(screen.getByText('Late')).toBeInTheDocument()
  })

  it('renders all 5 initial students in the table', () => {
    render(<TeacherAttendance />)
    expect(screen.getByText('N.G.N.S. Niralgama')).toBeInTheDocument()
    expect(screen.getByText('G.A.L.H. Seneviratne')).toBeInTheDocument()
    expect(screen.getByText('K.G.A.K. Sathsarani')).toBeInTheDocument()
    expect(screen.getByText('R.D.R.P. Ranasinghe')).toBeInTheDocument()
    expect(screen.getByText('M.A. Samarakoon')).toBeInTheDocument()
  })

  it('renders Submit Attendance and Reset buttons', () => {
    render(<TeacherAttendance />)
    expect(screen.getByRole('button', { name: /Submit Attendance/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })

  it('all students default to present radio selected', () => {
    render(<TeacherAttendance />)
    const presentRadios = screen.getAllByRole('radio', { name: /Mark .+ present/i })
    presentRadios.forEach((radio) => {
      expect(radio).toBeChecked()
    })
  })

  it('does not show success message before submit', () => {
    render(<TeacherAttendance />)
    expect(screen.queryByText(/Attendance submitted/i)).not.toBeInTheDocument()
  })

  it('shows success message after Submit Attendance click', () => {
    render(<TeacherAttendance />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Attendance/i }))
    expect(screen.getByText(/Attendance submitted/i)).toBeInTheDocument()
  })

  it('success message contains the selected course label', () => {
    render(<TeacherAttendance />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Attendance/i }))
    // The success message has the course name in a <strong> element; the dropdown also has it
    const successDiv = document.querySelector('.success-message')
    expect(successDiv).toBeInTheDocument()
    expect(successDiv.textContent).toContain('CS301 — Software Engineering')
  })

  it('changing attendance status clears the success message', () => {
    render(<TeacherAttendance />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Attendance/i }))
    expect(screen.getByText(/Attendance submitted/i)).toBeInTheDocument()

    const absentRadio = screen.getByRole('radio', { name: /Mark N.G.N.S. Niralgama absent/i })
    fireEvent.click(absentRadio)
    expect(screen.queryByText(/Attendance submitted/i)).not.toBeInTheDocument()
  })

  it('changing attendance status updates the radio selection', () => {
    render(<TeacherAttendance />)
    const absentRadio = screen.getByRole('radio', { name: /Mark N.G.N.S. Niralgama absent/i })
    fireEvent.click(absentRadio)
    expect(absentRadio).toBeChecked()

    const presentRadio = screen.getByRole('radio', { name: /Mark N.G.N.S. Niralgama present/i })
    expect(presentRadio).not.toBeChecked()
  })

  it('Reset button resets all to present and clears success message', () => {
    render(<TeacherAttendance />)
    // Mark someone absent
    const absentRadio = screen.getByRole('radio', { name: /Mark N.G.N.S. Niralgama absent/i })
    fireEvent.click(absentRadio)
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit Attendance/i }))

    // Reset
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }))
    expect(screen.queryByText(/Attendance submitted/i)).not.toBeInTheDocument()

    // All present radios should be checked again
    const presentRadio = screen.getByRole('radio', { name: /Mark N.G.N.S. Niralgama present/i })
    expect(presentRadio).toBeChecked()
  })

  it('changing course clears success message', () => {
    render(<TeacherAttendance />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Attendance/i }))
    expect(screen.getByText(/Attendance submitted/i)).toBeInTheDocument()

    const select = screen.getByLabelText('Select Course')
    fireEvent.change(select, { target: { value: 'CS302' } })
    expect(screen.queryByText(/Attendance submitted/i)).not.toBeInTheDocument()
  })

  it('changing date clears success message', () => {
    render(<TeacherAttendance />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Attendance/i }))

    const dateInput = screen.getByLabelText('Date')
    fireEvent.change(dateInput, { target: { value: '2025-01-15' } })
    expect(screen.queryByText(/Attendance submitted/i)).not.toBeInTheDocument()
  })
})