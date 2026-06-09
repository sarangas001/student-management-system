import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StudentSchedule from '../pages/student/StudentSchedule'

describe('StudentSchedule component', () => {
  it('renders "My Class Timetable" heading', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('My Class Timetable')).toBeInTheDocument()
  })

  it('renders table headers: Day, Time, Course, Room, Teacher', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Course')).toBeInTheDocument()
    expect(screen.getByText('Room')).toBeInTheDocument()
    expect(screen.getByText('Teacher')).toBeInTheDocument()
  })

  it('renders all 6 schedule rows', () => {
    render(<StudentSchedule />)
    const rows = screen.getAllByRole('row')
    // 1 header row + 6 data rows
    expect(rows.length).toBe(7)
  })

  it('renders Monday schedule entries', () => {
    render(<StudentSchedule />)
    const mondayCells = screen.getAllByText('Monday')
    expect(mondayCells.length).toBe(2) // Two Monday entries
  })

  it('renders CS301 Software Engineering entry', () => {
    render(<StudentSchedule />)
    const cs301Cells = screen.getAllByText('CS301 — Software Engineering')
    expect(cs301Cells.length).toBe(2) // Mon + Wed
  })

  it('renders correct time for Monday/Wednesday class (08:00 - 10:00)', () => {
    render(<StudentSchedule />)
    // 08:00 – 10:00 appears for Mon CS301 and Wed CS301
    const timeCells = screen.getAllByText('08:00 – 10:00')
    expect(timeCells.length).toBeGreaterThanOrEqual(1)
  })

  it('renders EN102 Technical English on Monday', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('EN102 — Technical English')).toBeInTheDocument()
  })

  it('renders MA201 Mathematics II (appears on Tuesday and Friday)', () => {
    render(<StudentSchedule />)
    const ma201Cells = screen.getAllByText('MA201 — Mathematics II')
    expect(ma201Cells.length).toBe(2) // Tue + Fri
  })

  it('renders CS401 Data Structures on Thursday', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('CS401 — Data Structures')).toBeInTheDocument()
  })

  it('renders room A201 for Software Engineering classes', () => {
    render(<StudentSchedule />)
    const a201Cells = screen.getAllByText('A201')
    expect(a201Cells.length).toBe(2)
  })

  it('renders teacher names correctly', () => {
    render(<StudentSchedule />)
    expect(screen.getAllByText('Dr. Gunawardena').length).toBe(2)
    expect(screen.getByText('Ms. Kumari')).toBeInTheDocument()
    expect(screen.getAllByText('Dr. Bandara').length).toBe(2)
    expect(screen.getByText('Ms. Perera')).toBeInTheDocument()
  })

  it('renders Wednesday schedule entry', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('Wednesday')).toBeInTheDocument()
  })

  it('renders Thursday schedule entry', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('Thursday')).toBeInTheDocument()
  })

  it('renders Friday schedule entry', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('Friday')).toBeInTheDocument()
  })

  it('renders room D104 for EN102', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('D104')).toBeInTheDocument()
  })

  it('renders room B105 for CS401', () => {
    render(<StudentSchedule />)
    expect(screen.getByText('B105')).toBeInTheDocument()
  })

  it('renders room C302 for Math classes', () => {
    render(<StudentSchedule />)
    const c302Cells = screen.getAllByText('C302')
    expect(c302Cells.length).toBe(2)
  })
})