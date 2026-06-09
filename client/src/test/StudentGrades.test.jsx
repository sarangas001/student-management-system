import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StudentGrades from '../pages/student/StudentGrades'

describe('StudentGrades component', () => {
  it('renders "My Grade Report" heading', () => {
    render(<StudentGrades />)
    expect(screen.getByText('My Grade Report')).toBeInTheDocument()
  })

  it('renders "Performance Overview" heading', () => {
    render(<StudentGrades />)
    expect(screen.getByText('Performance Overview')).toBeInTheDocument()
  })

  it('renders Download button', () => {
    render(<StudentGrades />)
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
  })

  it('renders grade table headers', () => {
    render(<StudentGrades />)
    expect(screen.getByText('Course')).toBeInTheDocument()
    expect(screen.getByText('Mid Exam')).toBeInTheDocument()
    expect(screen.getByText('Final Exam')).toBeInTheDocument()
    expect(screen.getByText('Assignment')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Grade')).toBeInTheDocument()
  })

  it('renders all 4 courses', () => {
    render(<StudentGrades />)
    // Each course appears in both the grade table and the performance overview
    expect(screen.getAllByText(/CS301 — Software Engineering/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/CS401 — Data Structures/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/MA201 — Mathematics II/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/EN102 — Technical English/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders correct grades in badge spans', () => {
    render(<StudentGrades />)
    // Two courses have grade 'A' (CS301, EN102)
    const gradeBadges = screen.getAllByText('A')
    expect(gradeBadges.length).toBe(2)
  })

  it('renders B+ grade badge', () => {
    render(<StudentGrades />)
    expect(screen.getByText('B+')).toBeInTheDocument()
  })

  it('renders C+ grade badge', () => {
    render(<StudentGrades />)
    expect(screen.getByText('C+')).toBeInTheDocument()
  })

  it('renders "—" for null finalExam (MA201)', () => {
    render(<StudentGrades />)
    // MA201 has finalExam: null → should render '—'
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders numeric scores for non-null final exams', () => {
    render(<StudentGrades />)
    // CS301 finalExam = 85
    expect(screen.getByText('85')).toBeInTheDocument()
    // EN102 finalExam = 82
    expect(screen.getByText('82')).toBeInTheDocument()
  })

  it('renders mid exam scores', () => {
    render(<StudentGrades />)
    // CS301 midExam = 78
    expect(screen.getByText('78')).toBeInTheDocument()
  })

  it('renders total scores', () => {
    render(<StudentGrades />)
    // CS301 total = 84.3
    expect(screen.getByText('84.3')).toBeInTheDocument()
  })

  it('renders performance bars for each course', () => {
    render(<StudentGrades />)
    // Each course in the Performance Overview should have grade display
    // CS301 grade A with total 84.3%
    expect(screen.getByText(/A \(84.3%\)/)).toBeInTheDocument()
    expect(screen.getByText(/B\+ \(74%\)/)).toBeInTheDocument()
    expect(screen.getByText(/C\+ \(61.5%\)/)).toBeInTheDocument()
    expect(screen.getByText(/A \(88.3%\)/)).toBeInTheDocument()
  })

  it('renders badge-green class for grade A courses', () => {
    render(<StudentGrades />)
    const greenBadges = document.querySelectorAll('.badge-green')
    expect(greenBadges.length).toBe(2) // CS301 and EN102
  })

  it('renders badge-blue class for grade B+ course', () => {
    render(<StudentGrades />)
    const blueBadges = document.querySelectorAll('.badge-blue')
    expect(blueBadges.length).toBe(1) // CS401
  })

  it('renders badge-amber class for grade C+ course', () => {
    render(<StudentGrades />)
    const amberBadges = document.querySelectorAll('.badge-amber')
    expect(amberBadges.length).toBe(1) // MA201
  })

  it('performance bar fills have correct width styles', () => {
    render(<StudentGrades />)
    const fills = document.querySelectorAll('.grade-bar-fill')
    expect(fills.length).toBe(4)
    // CS301 total = 84.3%
    const cs301Fill = Array.from(fills).find(f => f.style.width === '84.3%')
    expect(cs301Fill).toBeDefined()
  })
})