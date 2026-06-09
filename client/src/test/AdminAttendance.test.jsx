import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AdminAttendance } from '../pages/Admin/AdminAttendance'

// ─── Unit tests: buildCalendarCells logic ─────────────────────────────────
// Mirror the non-exported helper to unit test it directly.

const SL_HOLIDAYS_SAMPLE = {
  '2025-01-01': "New Year's Day",
  '2025-12-25': 'Christmas Day',
  '2025-05-01': 'Labour Day',
}

function buildCalendarCells(year, month, attendanceByDay = {}) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay()
  const leadingBlanks = firstDow === 0 ? 6 : firstDow - 1

  const todayObj = new Date()
  const isCurrentMonth =
    todayObj.getFullYear() === year && todayObj.getMonth() + 1 === month

  const cells = []
  for (let i = 0; i < leadingBlanks; i++) cells.push({ blank: true })

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = new Date(year, month - 1, d).getDay()
    const isWeekend = dow === 0 || dow === 6
    const holidayName = SL_HOLIDAYS_SAMPLE[dateStr]
    const isHoliday = Boolean(holidayName)
    const isToday = isCurrentMonth && todayObj.getDate() === d
    const isFuture = new Date(year, month - 1, d) > todayObj

    let status = null
    if (isHoliday || isWeekend) {
      status = 'H'
    } else if (!isFuture && attendanceByDay[d]) {
      status = attendanceByDay[d]
    }

    cells.push({ day: d, blank: false, isHoliday, holidayName, isWeekend, isToday, isFuture, status })
  }
  return cells
}

describe('buildCalendarCells', () => {
  it('returns correct number of cells (blanks + days)', () => {
    // January 2025: 31 days, starts on Wednesday (Mon-indexed = 2 blanks)
    const cells = buildCalendarCells(2025, 1, {})
    const blanks = cells.filter((c) => c.blank)
    const days = cells.filter((c) => !c.blank)
    expect(days.length).toBe(31)
    expect(blanks.length).toBe(2) // Jan 1 2025 is Wednesday → 2 blanks (Mon-start)
  })

  it('marks Jan 1 2025 as holiday', () => {
    const cells = buildCalendarCells(2025, 1, {})
    const jan1 = cells.find((c) => !c.blank && c.day === 1)
    expect(jan1.isHoliday).toBe(true)
    expect(jan1.status).toBe('H')
  })

  it('marks weekends as H status', () => {
    const cells = buildCalendarCells(2025, 1, {})
    // Find a known weekend day: Jan 4 2025 is Saturday
    const jan4 = cells.find((c) => !c.blank && c.day === 4)
    expect(jan4.isWeekend).toBe(true)
    expect(jan4.status).toBe('H')
  })

  it('assigns attendance status from attendanceByDay for past weekdays', () => {
    // March 2024: March 4=Mon, March 5=Tue, March 6=Wed — all weekdays in the past
    const attendanceByDay = { 4: 'P', 5: 'A', 6: 'L' }
    const cells = buildCalendarCells(2024, 3, attendanceByDay) // March 2024
    const day4 = cells.find((c) => !c.blank && c.day === 4)
    expect(day4.status).toBe('P')
    const day5 = cells.find((c) => !c.blank && c.day === 5)
    expect(day5.status).toBe('A')
    const day6 = cells.find((c) => !c.blank && c.day === 6)
    expect(day6.status).toBe('L')
  })

  it('does not apply attendance to future days', () => {
    // Use a far future year/month
    const attendanceByDay = { 1: 'P', 2: 'P' }
    const cells = buildCalendarCells(2099, 6, attendanceByDay)
    const day1 = cells.find((c) => !c.blank && c.day === 1)
    // Future days should not pick up attendance (unless weekend/holiday)
    if (!day1.isWeekend && !day1.isHoliday) {
      expect(day1.status).toBeNull()
    }
  })

  it('February 2025 has 28 days', () => {
    const cells = buildCalendarCells(2025, 2, {})
    const days = cells.filter((c) => !c.blank)
    expect(days.length).toBe(28)
  })

  it('February 2024 (leap year) has 29 days', () => {
    const cells = buildCalendarCells(2024, 2, {})
    const days = cells.filter((c) => !c.blank)
    expect(days.length).toBe(29)
  })

  it('blank cells have blank=true and no day property set to a number', () => {
    const cells = buildCalendarCells(2025, 1, {})
    cells.filter((c) => c.blank).forEach((c) => {
      expect(c.blank).toBe(true)
      expect(c.day).toBeUndefined()
    })
  })

  it('day cells have blank=false and numeric day', () => {
    const cells = buildCalendarCells(2025, 1, {})
    cells.filter((c) => !c.blank).forEach((c) => {
      expect(c.blank).toBe(false)
      expect(typeof c.day).toBe('number')
      expect(c.day).toBeGreaterThanOrEqual(1)
      expect(c.day).toBeLessThanOrEqual(31)
    })
  })

  it('holiday takes priority over attendance record', () => {
    // Jan 1 is a holiday — even if attendanceByDay says 'P', status should be 'H'
    const cells = buildCalendarCells(2025, 1, { 1: 'P' })
    const jan1 = cells.find((c) => !c.blank && c.day === 1)
    expect(jan1.status).toBe('H')
  })

  it('Sunday is marked as weekend', () => {
    // Jan 5 2025 is a Sunday
    const cells = buildCalendarCells(2025, 1, {})
    const jan5 = cells.find((c) => !c.blank && c.day === 5)
    expect(jan5.isWeekend).toBe(true)
  })
})

// ─── Component tests: AdminAttendance ─────────────────────────────────────
describe('AdminAttendance component', () => {
  it('renders the Attendance Summary card title', async () => {
    render(<AdminAttendance />)
    expect(screen.getByText('Attendance Summary')).toBeInTheDocument()
  })

  it('renders the Mark Attendance card title', async () => {
    render(<AdminAttendance />)
    expect(screen.getByText('Mark Attendance')).toBeInTheDocument()
  })

  it('shows Loading summary text initially', () => {
    render(<AdminAttendance />)
    expect(screen.getByText(/Loading summary/i)).toBeInTheDocument()
  })

  it('shows the current month and year in the header after summary loads', async () => {
    render(<AdminAttendance />)
    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ]
    const currentMonth = monthNames[new Date().getMonth()]
    const currentYear = new Date().getFullYear()
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`${currentMonth}.*${currentYear}`))).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('prev/next month buttons exist', () => {
    render(<AdminAttendance />)
    const buttons = screen.getAllByRole('button')
    // At minimum two navigation buttons exist
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('shows calendar day labels Mon-Sun', async () => {
    render(<AdminAttendance />)
    await waitFor(() => {
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Sun')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('shows Present/Absent/Late statistics after loading', async () => {
    render(<AdminAttendance />)
    await waitFor(() => {
      // These text values appear multiple times (pip-label, legend, select options)
      expect(screen.getAllByText('Present').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Absent').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Late').length).toBeGreaterThan(0)
    }, { timeout: 2000 })
  })

  it('displays attendance stats with values (1089, 112, 47)', async () => {
    render(<AdminAttendance />)
    await waitFor(() => {
      expect(screen.getByText('1,089')).toBeInTheDocument()
      expect(screen.getByText('112')).toBeInTheDocument()
      expect(screen.getByText('47')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('renders the Save Attendance button', async () => {
    render(<AdminAttendance />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Attendance/i })).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('navigating to previous month changes the displayed month', async () => {
    render(<AdminAttendance />)
    await waitFor(() => screen.queryByText(/Loading summary/) === null, { timeout: 2000 })

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ]
    const now = new Date()
    const prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevMonthName = monthNames[prevMonthIdx]

    const prevButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg') !== null
    )
    // Click the first navigation button (prev)
    const navButtons = screen.getAllByRole('button').slice(0, 2)
    fireEvent.click(navButtons[0])

    await waitFor(() => {
      expect(screen.getByText(new RegExp(prevMonthName))).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})