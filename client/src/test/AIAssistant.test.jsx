import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AIAssistant from '../pages/AIAssistant'
import { AI_ROLES } from '../util/context'

describe('AIAssistant component', () => {
  describe('admin role', () => {
    it('renders the ai-assistant div', () => {
      render(<AIAssistant role="admin" />)
      expect(document.getElementById('ai-assistant')).toBeInTheDocument()
    })

    it('renders the admin title from AI_ROLES', () => {
      render(<AIAssistant role="admin" />)
      expect(screen.getByText(AI_ROLES.admin.title)).toBeInTheDocument()
    })

    it('renders the admin sub text', () => {
      render(<AIAssistant role="admin" />)
      expect(screen.getByText(AI_ROLES.admin.sub)).toBeInTheDocument()
    })

    it('renders the admin role badge label', () => {
      render(<AIAssistant role="admin" />)
      expect(screen.getByText('Admin Access')).toBeInTheDocument()
    })

    it('does NOT render the access notice banner for admin', () => {
      render(<AIAssistant role="admin" />)
      expect(document.getElementById('ai-access-notice')).not.toBeInTheDocument()
    })

    it('renders admin chips', () => {
      render(<AIAssistant role="admin" />)
      AI_ROLES.admin.chips.forEach((chip) => {
        expect(screen.getByText(chip)).toBeInTheDocument()
      })
    })

    it('renders Ask button', () => {
      render(<AIAssistant role="admin" />)
      expect(screen.getByRole('button', { name: /Ask/i })).toBeInTheDocument()
    })

    it('renders textarea with admin fullPlaceholder', () => {
      render(<AIAssistant role="admin" />)
      const textarea = document.getElementById('full-input')
      expect(textarea).toBeInTheDocument()
      expect(textarea.placeholder).toBe(AI_ROLES.admin.fullPlaceholder)
    })

    it('renders admin sidebarLabel', () => {
      render(<AIAssistant role="admin" />)
      expect(screen.getByText(AI_ROLES.admin.sidebarLabel)).toBeInTheDocument()
    })

    it('renders all admin sidebar stats', () => {
      render(<AIAssistant role="admin" />)
      AI_ROLES.admin.sidebarStats.forEach(([k, v]) => {
        expect(screen.getByText(k)).toBeInTheDocument()
        expect(screen.getByText(v)).toBeInTheDocument()
      })
    })

    it('renders admin sidebar suggestions', () => {
      render(<AIAssistant role="admin" />)
      AI_ROLES.admin.sidebarSuggestions.forEach((suggestion) => {
        expect(screen.getByRole('button', { name: suggestion })).toBeInTheDocument()
      })
    })

    it('head has admin gradient class (from-[#7c3aed])', () => {
      render(<AIAssistant role="admin" />)
      const head = document.getElementById('ai-full-head')
      expect(head.className).toContain('from-[#7c3aed]')
    })
  })

  describe('teacher role', () => {
    it('renders teacher title', () => {
      render(<AIAssistant role="teacher" />)
      expect(screen.getByText(AI_ROLES.teacher.title)).toBeInTheDocument()
    })

    it('renders teacher role badge label', () => {
      render(<AIAssistant role="teacher" />)
      expect(screen.getByText('Teacher Access')).toBeInTheDocument()
    })

    it('renders the access notice banner for teacher', () => {
      render(<AIAssistant role="teacher" />)
      expect(document.getElementById('ai-access-notice')).toBeInTheDocument()
    })

    it('renders teacher notice boldText', () => {
      render(<AIAssistant role="teacher" />)
      expect(screen.getByText(AI_ROLES.teacher.notice.boldText)).toBeInTheDocument()
    })

    it('renders teacher chips', () => {
      render(<AIAssistant role="teacher" />)
      AI_ROLES.teacher.chips.forEach((chip) => {
        expect(screen.getByText(chip)).toBeInTheDocument()
      })
    })

    it('renders teacher placeholder text', () => {
      render(<AIAssistant role="teacher" />)
      const textarea = document.getElementById('full-input')
      expect(textarea.placeholder).toBe(AI_ROLES.teacher.fullPlaceholder)
    })

    it('renders teacher sidebarLabel', () => {
      render(<AIAssistant role="teacher" />)
      expect(screen.getByText(AI_ROLES.teacher.sidebarLabel)).toBeInTheDocument()
    })

    it('head has teacher gradient class (from-[#0f766e])', () => {
      render(<AIAssistant role="teacher" />)
      const head = document.getElementById('ai-full-head')
      expect(head.className).toContain('from-[#0f766e]')
    })

    it('send button has teacher gradient class', () => {
      render(<AIAssistant role="teacher" />)
      const sendBtn = document.getElementById('full-send-btn')
      expect(sendBtn.className).toContain('from-[#0f766e]')
    })
  })

  describe('student role', () => {
    it('renders student title', () => {
      render(<AIAssistant role="student" />)
      expect(screen.getByText(AI_ROLES.student.title)).toBeInTheDocument()
    })

    it('renders student role badge label', () => {
      render(<AIAssistant role="student" />)
      expect(screen.getByText('Student Access')).toBeInTheDocument()
    })

    it('renders the access notice banner for student', () => {
      render(<AIAssistant role="student" />)
      expect(document.getElementById('ai-access-notice')).toBeInTheDocument()
    })

    it('renders student notice boldText', () => {
      render(<AIAssistant role="student" />)
      expect(screen.getByText(AI_ROLES.student.notice.boldText)).toBeInTheDocument()
    })

    it('renders student chips', () => {
      render(<AIAssistant role="student" />)
      AI_ROLES.student.chips.forEach((chip) => {
        expect(screen.getByText(chip)).toBeInTheDocument()
      })
    })

    it('renders student placeholder text', () => {
      render(<AIAssistant role="student" />)
      const textarea = document.getElementById('full-input')
      expect(textarea.placeholder).toBe(AI_ROLES.student.fullPlaceholder)
    })

    it('head has student gradient class (from-[#b45309])', () => {
      render(<AIAssistant role="student" />)
      const head = document.getElementById('ai-full-head')
      expect(head.className).toContain('from-[#b45309]')
    })

    it('renders student sidebarLabel', () => {
      render(<AIAssistant role="student" />)
      expect(screen.getByText(AI_ROLES.student.sidebarLabel)).toBeInTheDocument()
    })
  })

  describe('shared structure', () => {
    it.each(['admin', 'teacher', 'student'])('role %s: renders ai-chips container', (role) => {
      render(<AIAssistant role={role} />)
      expect(document.getElementById('full-chips')).toBeInTheDocument()
    })

    it.each(['admin', 'teacher', 'student'])('role %s: renders ai-full-msgs container', (role) => {
      render(<AIAssistant role={role} />)
      expect(document.getElementById('full-msgs')).toBeInTheDocument()
    })

    it.each(['admin', 'teacher', 'student'])('role %s: renders ai-sidebar-panel', (role) => {
      render(<AIAssistant role={role} />)
      expect(document.getElementById('ai-sidebar-panel')).toBeInTheDocument()
    })

    it.each(['admin', 'teacher', 'student'])('role %s: renders the "Try asking…" section', (role) => {
      render(<AIAssistant role={role} />)
      expect(screen.getByText(/Try asking/)).toBeInTheDocument()
    })
  })
})