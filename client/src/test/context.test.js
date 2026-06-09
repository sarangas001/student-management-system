import { describe, it, expect } from 'vitest'
import { AI_ROLES } from '../util/context'

describe('AI_ROLES', () => {
  it('exports an object with admin, teacher, and student keys', () => {
    expect(AI_ROLES).toHaveProperty('admin')
    expect(AI_ROLES).toHaveProperty('teacher')
    expect(AI_ROLES).toHaveProperty('student')
  })

  describe('admin role', () => {
    const admin = AI_ROLES.admin

    it('has required fields', () => {
      expect(admin.label).toBe('Admin Access')
      expect(admin.title).toBe('Admin AI Assistant')
      expect(admin.notice).toBeNull()
    })

    it('has chips array with at least one item', () => {
      expect(Array.isArray(admin.chips)).toBe(true)
      expect(admin.chips.length).toBeGreaterThan(0)
    })

    it('has sidebarStats as array of [key, value] pairs', () => {
      expect(Array.isArray(admin.sidebarStats)).toBe(true)
      admin.sidebarStats.forEach(([k, v]) => {
        expect(typeof k).toBe('string')
        expect(typeof v).toBe('string')
      })
    })

    it('has sidebarSuggestions array', () => {
      expect(Array.isArray(admin.sidebarSuggestions)).toBe(true)
      expect(admin.sidebarSuggestions.length).toBeGreaterThan(0)
    })

    it('has fullPlaceholder and sidebarLabel strings', () => {
      expect(typeof admin.fullPlaceholder).toBe('string')
      expect(admin.fullPlaceholder.length).toBeGreaterThan(0)
      expect(typeof admin.sidebarLabel).toBe('string')
    })

    it('has systemPrompt string', () => {
      expect(typeof admin.systemPrompt).toBe('string')
      expect(admin.systemPrompt.length).toBeGreaterThan(0)
    })

    it('notice is null (admin has full access, no restriction banner)', () => {
      expect(admin.notice).toBeNull()
    })
  })

  describe('teacher role', () => {
    const teacher = AI_ROLES.teacher

    it('has required fields', () => {
      expect(teacher.label).toBe('Teacher Access')
      expect(teacher.title).toBe('Teacher AI Assistant')
    })

    it('has a non-null notice with boldText and normalText', () => {
      expect(teacher.notice).not.toBeNull()
      expect(teacher.notice).toHaveProperty('boldText')
      expect(teacher.notice).toHaveProperty('normalText')
      expect(typeof teacher.notice.boldText).toBe('string')
      expect(typeof teacher.notice.normalText).toBe('string')
    })

    it('has chips array', () => {
      expect(Array.isArray(teacher.chips)).toBe(true)
      expect(teacher.chips.length).toBeGreaterThan(0)
    })

    it('has sidebarStats array', () => {
      expect(Array.isArray(teacher.sidebarStats)).toBe(true)
    })

    it('has systemPrompt referencing CS301 and CS401', () => {
      expect(teacher.systemPrompt).toContain('CS301')
      expect(teacher.systemPrompt).toContain('CS401')
    })
  })

  describe('student role', () => {
    const student = AI_ROLES.student

    it('has required fields', () => {
      expect(student.label).toBe('Student Access')
      expect(student.title).toBe('My AI Study Assistant')
    })

    it('has a non-null notice with boldText and normalText', () => {
      expect(student.notice).not.toBeNull()
      expect(student.notice).toHaveProperty('boldText')
      expect(student.notice).toHaveProperty('normalText')
    })

    it('has chips array', () => {
      expect(Array.isArray(student.chips)).toBe(true)
      expect(student.chips.length).toBeGreaterThan(0)
    })

    it('has sidebarStats array of [key, value] pairs', () => {
      expect(Array.isArray(student.sidebarStats)).toBe(true)
      student.sidebarStats.forEach(([k, v]) => {
        expect(typeof k).toBe('string')
        expect(typeof v).toBe('string')
      })
    })

    it('systemPrompt enforces privacy (contains PRIVACY RULES)', () => {
      expect(student.systemPrompt).toContain('PRIVACY')
    })
  })

  it('all roles have the sub field as a string', () => {
    expect(typeof AI_ROLES.admin.sub).toBe('string')
    expect(typeof AI_ROLES.teacher.sub).toBe('string')
    expect(typeof AI_ROLES.student.sub).toBe('string')
  })

  it('all roles have the greeting field as a string', () => {
    expect(typeof AI_ROLES.admin.greeting).toBe('string')
    expect(typeof AI_ROLES.teacher.greeting).toBe('string')
    expect(typeof AI_ROLES.student.greeting).toBe('string')
  })

  it('admin and student sidebarStats include "My GPA" or overview stats', () => {
    // admin has Faculty Overview stats
    const adminKeys = AI_ROLES.admin.sidebarStats.map(([k]) => k)
    expect(adminKeys).toContain('Total Students')

    // student has personal stats
    const studentKeys = AI_ROLES.student.sidebarStats.map(([k]) => k)
    expect(studentKeys).toContain('My GPA')
  })
})