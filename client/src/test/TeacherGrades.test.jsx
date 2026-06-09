import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TeacherEnterGrades from '../pages/Teacher/TeacherGrades'

// ─── Pure-logic helpers mirroring the component internals ──────────────────
// These duplicate the non-exported functions so they can be unit-tested directly.
function getGrade(score) {
  if (score === '' || score === null) return null
  const s = Number(score)
  if (s >= 90) return { letter: 'A+', color: '#16a34a', bg: '#f0fdf4' }
  if (s >= 80) return { letter: 'A',  color: '#16a34a', bg: '#f0fdf4' }
  if (s >= 70) return { letter: 'B',  color: '#2563eb', bg: '#eff6ff' }
  if (s >= 60) return { letter: 'C',  color: '#d97706', bg: '#fffbeb' }
  if (s >= 50) return { letter: 'D',  color: '#ea580c', bg: '#fff7ed' }
  return       { letter: 'F',  color: '#dc2626', bg: '#fef2f2' }
}

function getRemarks(score) {
  if (score === '' || score === null) return ''
  const s = Number(score)
  if (s >= 90) return 'Outstanding'
  if (s >= 80) return 'Excellent'
  if (s >= 70) return 'Good'
  if (s >= 60) return 'Average'
  if (s >= 50) return 'Needs review'
  return 'Failed'
}

// ─── Unit tests: getGrade ──────────────────────────────────────────────────
describe('getGrade', () => {
  it('returns null for empty string', () => {
    expect(getGrade('')).toBeNull()
  })

  it('returns null for null', () => {
    expect(getGrade(null)).toBeNull()
  })

  it('returns A+ for score >= 90', () => {
    expect(getGrade(90).letter).toBe('A+')
    expect(getGrade(100).letter).toBe('A+')
    expect(getGrade(95).letter).toBe('A+')
  })

  it('returns A for score 80–89', () => {
    expect(getGrade(80).letter).toBe('A')
    expect(getGrade(89).letter).toBe('A')
    expect(getGrade(85).letter).toBe('A')
  })

  it('returns B for score 70–79', () => {
    expect(getGrade(70).letter).toBe('B')
    expect(getGrade(79).letter).toBe('B')
  })

  it('returns C for score 60–69', () => {
    expect(getGrade(60).letter).toBe('C')
    expect(getGrade(69).letter).toBe('C')
  })

  it('returns D for score 50–59', () => {
    expect(getGrade(50).letter).toBe('D')
    expect(getGrade(59).letter).toBe('D')
  })

  it('returns F for score below 50', () => {
    expect(getGrade(49).letter).toBe('F')
    expect(getGrade(0).letter).toBe('F')
    expect(getGrade(1).letter).toBe('F')
  })

  it('returns correct colors for each grade band', () => {
    expect(getGrade(95).color).toBe('#16a34a') // A+
    expect(getGrade(75).color).toBe('#2563eb') // B
    expect(getGrade(65).color).toBe('#d97706') // C
    expect(getGrade(55).color).toBe('#ea580c') // D
    expect(getGrade(40).color).toBe('#dc2626') // F
  })

  it('handles string numbers', () => {
    expect(getGrade('85').letter).toBe('A')
    expect(getGrade('72').letter).toBe('B')
    expect(getGrade('58').letter).toBe('D')
  })

  it('boundary: 90 is A+ not A', () => {
    expect(getGrade(90).letter).toBe('A+')
  })

  it('boundary: 80 is A not B', () => {
    expect(getGrade(80).letter).toBe('A')
  })

  it('boundary: 50 is D not F', () => {
    expect(getGrade(50).letter).toBe('D')
  })
})

// ─── Unit tests: getRemarks ────────────────────────────────────────────────
describe('getRemarks', () => {
  it('returns empty string for empty score', () => {
    expect(getRemarks('')).toBe('')
    expect(getRemarks(null)).toBe('')
  })

  it('returns Outstanding for score >= 90', () => {
    expect(getRemarks(90)).toBe('Outstanding')
    expect(getRemarks(100)).toBe('Outstanding')
  })

  it('returns Excellent for score 80–89', () => {
    expect(getRemarks(80)).toBe('Excellent')
    expect(getRemarks(89)).toBe('Excellent')
  })

  it('returns Good for score 70–79', () => {
    expect(getRemarks(70)).toBe('Good')
    expect(getRemarks(79)).toBe('Good')
  })

  it('returns Average for score 60–69', () => {
    expect(getRemarks(60)).toBe('Average')
    expect(getRemarks(69)).toBe('Average')
  })

  it('returns Needs review for score 50–59', () => {
    expect(getRemarks(50)).toBe('Needs review')
    expect(getRemarks(59)).toBe('Needs review')
  })

  it('returns Failed for score < 50', () => {
    expect(getRemarks(49)).toBe('Failed')
    expect(getRemarks(0)).toBe('Failed')
  })

  it('handles string numbers', () => {
    expect(getRemarks('85')).toBe('Excellent')
    expect(getRemarks('45')).toBe('Failed')
  })
})

// ─── Component tests: TeacherEnterGrades ──────────────────────────────────
describe('TeacherEnterGrades component', () => {
  it('renders "Enter Grades" heading', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByText('Enter Grades')).toBeInTheDocument()
  })

  it('renders Course and Assessment Type dropdowns', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByLabelText('Course')).toBeInTheDocument()
    expect(screen.getByLabelText('Assessment Type')).toBeInTheDocument()
  })

  it('course dropdown has CS301 as default selection', () => {
    render(<TeacherEnterGrades />)
    const courseSelect = screen.getByLabelText('Course')
    expect(courseSelect.value).toBe('CS301')
  })

  it('course dropdown lists all 3 courses', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByText('CS301 — Software Engineering')).toBeInTheDocument()
    expect(screen.getByText('CS302 — Database Management')).toBeInTheDocument()
    expect(screen.getByText('CS303 — Operating Systems')).toBeInTheDocument()
  })

  it('assessment type dropdown lists all 4 types', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByText('Final Exam')).toBeInTheDocument()
    expect(screen.getByText('Mid Exam')).toBeInTheDocument()
    expect(screen.getByText('Assignment')).toBeInTheDocument()
    expect(screen.getByText('Quiz')).toBeInTheDocument()
  })

  it('renders table headers: Student, Score, Auto Grade, Remarks', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText(/Score/)).toBeInTheDocument()
    expect(screen.getByText('Auto Grade')).toBeInTheDocument()
    expect(screen.getByText('Remarks')).toBeInTheDocument()
  })

  it('renders all 5 initial students', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByText(/Niralgama/)).toBeInTheDocument()
    expect(screen.getByText(/Seneviratne/)).toBeInTheDocument()
    expect(screen.getByText(/Sathsarani/)).toBeInTheDocument()
    expect(screen.getByText(/Ranasinghe/)).toBeInTheDocument()
    expect(screen.getByText(/Samarakoon/)).toBeInTheDocument()
  })

  it('renders Publish Grades button', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByRole('button', { name: /Publish Grades/i })).toBeInTheDocument()
  })

  it('does not show success message before publishing', () => {
    render(<TeacherEnterGrades />)
    expect(screen.queryByText(/Grades published successfully/i)).not.toBeInTheDocument()
  })

  it('shows success message after clicking Publish Grades', () => {
    render(<TeacherEnterGrades />)
    const btn = screen.getByRole('button', { name: /Publish Grades/i })
    fireEvent.click(btn)
    expect(screen.getByText(/Grades published successfully/i)).toBeInTheDocument()
  })

  it('success message contains the selected course label', () => {
    render(<TeacherEnterGrades />)
    fireEvent.click(screen.getByRole('button', { name: /Publish Grades/i }))
    // success div contains the course name (it also appears in the dropdown option)
    const successMsg = screen.getByText(/Grades published successfully/i).closest('div')
    expect(successMsg.textContent).toContain('CS301 — Software Engineering')
  })

  it('changing course clears the published success message', () => {
    render(<TeacherEnterGrades />)
    fireEvent.click(screen.getByRole('button', { name: /Publish Grades/i }))
    expect(screen.getByText(/Grades published successfully/i)).toBeInTheDocument()

    const courseSelect = screen.getByLabelText('Course')
    fireEvent.change(courseSelect, { target: { value: 'CS302' } })
    expect(screen.queryByText(/Grades published successfully/i)).not.toBeInTheDocument()
  })

  it('changing assessment type clears the published success message', () => {
    render(<TeacherEnterGrades />)
    fireEvent.click(screen.getByRole('button', { name: /Publish Grades/i }))

    const assessmentSelect = screen.getByLabelText('Assessment Type')
    fireEvent.change(assessmentSelect, { target: { value: 'mid' } })
    expect(screen.queryByText(/Grades published successfully/i)).not.toBeInTheDocument()
  })

  it('shows auto grade badge for initial score of 85 (A)', () => {
    render(<TeacherEnterGrades />)
    // FC222038 Niralgama has initial score 85 → grade A
    const gradeBadges = screen.getAllByText('A')
    expect(gradeBadges.length).toBeGreaterThan(0)
  })

  it('shows A+ badge for scores >= 90 (Sathsarani=91, Samarakoon=92)', () => {
    render(<TeacherEnterGrades />)
    // Both FC222015 (91) and FC222022 (92) earn A+
    const aPlusBadges = screen.getAllByText('A+')
    expect(aPlusBadges.length).toBe(2)
  })

  it('shows D badge for score 58 (Ranasinghe)', () => {
    render(<TeacherEnterGrades />)
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('remarks input has initial value matching score band', () => {
    render(<TeacherEnterGrades />)
    // FC222038 Niralgama: score=85 → Excellent
    const remarksInputs = document.querySelectorAll('input[type="text"]')
    const excellentInputs = Array.from(remarksInputs).filter(i => i.value === 'Excellent')
    expect(excellentInputs.length).toBeGreaterThan(0)
  })
})