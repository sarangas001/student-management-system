import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminStudents } from '../pages/Admin/AdminStudents'

// ─── Filter logic unit tests (mirroring filteredStudents useMemo) ─────────
describe('student filter logic', () => {
  const students = [
    { id: 'FC222010', name: 'R.A.D.S. Methmini',     department: 'SE', year: '1', email: 'm@usj.ac.lk', status: 'Active' },
    { id: 'FC222015', name: 'K.G.A.K. Sathsarani',   department: 'SE', year: '1', email: 's@usj.ac.lk', status: 'Active' },
    { id: 'FC222016', name: 'R.D.R.P. Ranasinghe',   department: 'IS', year: '2', email: 'r@usj.ac.lk', status: 'Active' },
    { id: 'FC222022', name: 'M.A. Samarakoon',        department: 'CS', year: '1', email: 'k@usj.ac.lk', status: 'On Leave' },
    { id: 'FC222032', name: 'R.S. Daraniyagala',      department: 'SE', year: '3', email: 'd@usj.ac.lk', status: 'Active' },
    { id: 'FC222038', name: 'N.G.N.S. Niralgama',     department: 'CS', year: '3', email: 'n@usj.ac.lk', status: 'Active' },
    { id: 'FC222039', name: 'G.A.L.H. Seneviratne',  department: 'CS', year: '2', email: 'se@usj.ac.lk', status: 'Active' },
  ]

  function filterStudents(students, selectedDepartment, selectedYear, searchQuery) {
    return students.filter((student) => {
      const departmentMatch = selectedDepartment === '' || student.department === selectedDepartment
      const yearMatch = selectedYear === '' || student.year === selectedYear
      const searchMatch = !searchQuery ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      return departmentMatch && yearMatch && searchMatch
    })
  }

  it('returns all students when no filters applied', () => {
    expect(filterStudents(students, '', '', '')).toHaveLength(7)
  })

  it('filters by department SE', () => {
    const result = filterStudents(students, 'SE', '', '')
    expect(result).toHaveLength(3)
    result.forEach((s) => expect(s.department).toBe('SE'))
  })

  it('filters by department CS', () => {
    const result = filterStudents(students, 'CS', '', '')
    expect(result).toHaveLength(3)
    result.forEach((s) => expect(s.department).toBe('CS'))
  })

  it('filters by department IS', () => {
    const result = filterStudents(students, 'IS', '', '')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('R.D.R.P. Ranasinghe')
  })

  it('filters by year 1', () => {
    const result = filterStudents(students, '', '1', '')
    expect(result).toHaveLength(3)
    result.forEach((s) => expect(s.year).toBe('1'))
  })

  it('filters by year 2', () => {
    const result = filterStudents(students, '', '2', '')
    expect(result).toHaveLength(2)
  })

  it('filters by year 3', () => {
    const result = filterStudents(students, '', '3', '')
    expect(result).toHaveLength(2)
  })

  it('filters by department AND year combined', () => {
    const result = filterStudents(students, 'SE', '1', '')
    expect(result).toHaveLength(2)
    result.forEach((s) => {
      expect(s.department).toBe('SE')
      expect(s.year).toBe('1')
    })
  })

  it('filters by search query matching ID (case-insensitive)', () => {
    const result = filterStudents(students, '', '', 'fc222010')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('R.A.D.S. Methmini')
  })

  it('filters by search query matching name', () => {
    const result = filterStudents(students, '', '', 'niralgama')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('FC222038')
  })

  it('search is case-insensitive', () => {
    const result = filterStudents(students, '', '', 'METHMINI')
    expect(result).toHaveLength(1)
  })

  it('returns empty array when no match', () => {
    const result = filterStudents(students, '', '', 'XXXXXX')
    expect(result).toHaveLength(0)
  })

  it('combined department + search filter', () => {
    const result = filterStudents(students, 'CS', '', 'niralgama')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('FC222038')
  })

  it('department filter with no matching students returns empty', () => {
    const result = filterStudents(students, 'IS', '1', '')
    expect(result).toHaveLength(0)
  })
})

// ─── Component tests: AdminStudents ──────────────────────────────────────
describe('AdminStudents component', () => {
  it('renders "Student Records" card title', () => {
    render(<AdminStudents />)
    expect(screen.getByText('Student Records')).toBeInTheDocument()
  })

  it('renders Add Student button', () => {
    render(<AdminStudents />)
    expect(screen.getByRole('button', { name: /Add Student/i })).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<AdminStudents />)
    expect(screen.getByPlaceholderText(/Search by name or student ID/i)).toBeInTheDocument()
  })

  it('renders department filter select', () => {
    render(<AdminStudents />)
    expect(screen.getByRole('option', { name: 'All Departments' })).toBeInTheDocument()
  })

  it('renders year filter select', () => {
    render(<AdminStudents />)
    expect(screen.getByRole('option', { name: 'All Years' })).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<AdminStudents />)
    expect(screen.getByText(/Loading students/i)).toBeInTheDocument()
  })

  it('shows students table after data loads', async () => {
    render(<AdminStudents />)
    await waitFor(() => {
      expect(screen.getByText('R.A.D.S. Methmini')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows all 7 students after loading', async () => {
    render(<AdminStudents />)
    await waitFor(() => {
      expect(screen.getByText('N.G.N.S. Niralgama')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText('R.A.D.S. Methmini')).toBeInTheDocument()
    expect(screen.getByText('K.G.A.K. Sathsarani')).toBeInTheDocument()
    expect(screen.getByText('R.D.R.P. Ranasinghe')).toBeInTheDocument()
    expect(screen.getByText('M.A. Samarakoon')).toBeInTheDocument()
    expect(screen.getByText('R.S. Daraniyagala')).toBeInTheDocument()
    expect(screen.getByText('G.A.L.H. Seneviratne')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<AdminStudents />)
    expect(screen.getByText('Student ID')).toBeInTheDocument()
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('opens Add Student modal when Add Student button is clicked', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }))
    // "Add Student" appears in the button AND the modal card-title - check for the form field instead
    expect(screen.getByPlaceholderText('FC222xxx')).toBeInTheDocument()
    // Modal title should appear (there will be two "Add Student" - button + modal title)
    const addStudentTexts = screen.getAllByText('Add Student')
    expect(addStudentTexts.length).toBeGreaterThanOrEqual(2)
  })

  it('closes modal when Cancel button is clicked', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }))
    expect(screen.getByPlaceholderText('FC222xxx')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(screen.queryByPlaceholderText('FC222xxx')).not.toBeInTheDocument()
  })

  it('search filters students by name', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    const searchInput = screen.getByPlaceholderText(/Search by name or student ID/i)
    fireEvent.change(searchInput, { target: { value: 'Niralgama' } })

    expect(screen.getByText('N.G.N.S. Niralgama')).toBeInTheDocument()
    expect(screen.queryByText('R.A.D.S. Methmini')).not.toBeInTheDocument()
  })

  it('search by student ID works', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    const searchInput = screen.getByPlaceholderText(/Search by name or student ID/i)
    fireEvent.change(searchInput, { target: { value: 'FC222010' } })

    expect(screen.getByText('R.A.D.S. Methmini')).toBeInTheDocument()
    expect(screen.queryByText('N.G.N.S. Niralgama')).not.toBeInTheDocument()
  })

  it('shows No students found when search has no results', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    const searchInput = screen.getByPlaceholderText(/Search by name or student ID/i)
    fireEvent.change(searchInput, { target: { value: 'XXXXNOTFOUND' } })

    expect(screen.getByText('No students found.')).toBeInTheDocument()
  })

  it('department filter by SE shows only SE students', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    const deptSelects = screen.getAllByRole('combobox')
    // First select is dept filter
    fireEvent.change(deptSelects[0], { target: { value: 'SE' } })

    expect(screen.getByText('R.A.D.S. Methmini')).toBeInTheDocument()
    // CS department students should be hidden
    expect(screen.queryByText('N.G.N.S. Niralgama')).not.toBeInTheDocument()
  })

  it('Active status badge uses badge-green class', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    const activeBadges = document.querySelectorAll('.badge-green')
    expect(activeBadges.length).toBeGreaterThan(0)
  })

  it('On Leave status badge uses badge-amber class', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('M.A. Samarakoon'), { timeout: 3000 })

    const amberBadges = document.querySelectorAll('.badge-amber')
    expect(amberBadges.length).toBe(1)
  })

  it('Edit modal shows correct title for editing', async () => {
    render(<AdminStudents />)
    await waitFor(() => screen.getByText('R.A.D.S. Methmini'), { timeout: 3000 })

    // Click first edit button
    const editButtons = document.querySelectorAll('.btn.btn-sm')
    // Filter for edit buttons (they have edit icon)
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Edit Student')).toBeInTheDocument()
    })
  })
})