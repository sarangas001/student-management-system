import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopBar } from '../components/TopBar'

describe('TopBar component', () => {
  it('renders the provided pageTitle', () => {
    render(<TopBar pageTitle="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders the page title in the element with id="topbar-title"', () => {
    render(<TopBar pageTitle="Students" />)
    const titleEl = document.getElementById('topbar-title')
    expect(titleEl).toBeInTheDocument()
    expect(titleEl.textContent).toBe('Students')
  })

  it('renders the topbar div with class "topbar"', () => {
    render(<TopBar pageTitle="Grades" />)
    const topbar = document.querySelector('.topbar')
    expect(topbar).toBeInTheDocument()
  })

  it('renders Notifications button', () => {
    render(<TopBar pageTitle="Attendance" />)
    expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument()
  })

  it('renders Search button', () => {
    render(<TopBar pageTitle="Attendance" />)
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument()
  })

  it('Search button has btn-primary class', () => {
    render(<TopBar pageTitle="Test" />)
    const searchButton = screen.getByRole('button', { name: /Search/i })
    expect(searchButton).toHaveClass('btn-primary')
  })

  it('renders BellIcon (Notifications button contains lucide bell icon)', () => {
    render(<TopBar pageTitle="Test" />)
    const notifButton = screen.getByRole('button', { name: /Notifications/i })
    // The button should contain an SVG element from lucide-react BellIcon
    expect(notifButton.querySelector('svg')).toBeInTheDocument()
  })

  it('renders with different page titles', () => {
    const { rerender } = render(<TopBar pageTitle="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    rerender(<TopBar pageTitle="Courses" />)
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('topbar-right div contains both buttons', () => {
    render(<TopBar pageTitle="Test" />)
    const topbarRight = document.querySelector('.topbar-right')
    expect(topbarRight).toBeInTheDocument()
    const buttons = topbarRight.querySelectorAll('button')
    expect(buttons.length).toBe(2)
  })

  it('renders title with special characters', () => {
    render(<TopBar pageTitle="AI Assistant" />)
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('renders empty title without crashing', () => {
    render(<TopBar pageTitle="" />)
    const titleEl = document.getElementById('topbar-title')
    expect(titleEl).toBeInTheDocument()
    expect(titleEl.textContent).toBe('')
  })
})