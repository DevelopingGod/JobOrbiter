import { extractResumeData } from '@/agents/resumeExtractor'

const VALID_RESUME_JSON = {
  contact: {
    email: 'john.doe@example.com',
    phone: null,
    linkedin: null,
    github: null,
    portfolio: null,
  },
  skills: ['JavaScript', 'React'],
  experience: [
    {
      title: 'Frontend Developer',
      company: 'Acme Corp',
      startDate: '2019-01',
      endDate: 'Present',
      description: ['Built React applications'],
    },
  ],
  education: [
    {
      degree: 'BS in Computer Science',
      institution: 'State University',
      graduationYear: '2018',
    },
  ],
}

let mockCreate = jest.fn()

// Mock the Groq SDK
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: (...args: any[]) => mockCreate(...args),
        },
      },
    }
  })
})

describe('resumeExtractor AI Agent', () => {
  beforeEach(() => {
    mockCreate = jest.fn()
  })

  it('parses a well-formed AI response into the real nested resume shape', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(VALID_RESUME_JSON) } }],
    })

    const fakeRawText = 'John Doe\nFrontend Developer\nSkills: JavaScript, React'

    const result = await extractResumeData(fakeRawText)

    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(Array.isArray(result.data.skills)).toBe(true)
    expect(result.data.skills[0]).toBe('JavaScript')
    // The bug this replaces: the old mock returned experience/education as
    // plain strings, which never matched the real interface's array-of-object
    // shape — asserting into the nested fields catches that class of mismatch.
    expect(Array.isArray(result.data.experience)).toBe(true)
    expect(result.data.experience[0].title).toBe('Frontend Developer')
    expect(result.data.experience[0].company).toBe('Acme Corp')
    expect(Array.isArray(result.data.education)).toBe(true)
    expect(result.data.education[0].degree).toBe('BS in Computer Science')
    expect(result.data.contact.email).toBe('john.doe@example.com')
  })

  it('returns a status:error result when the AI response is not valid JSON', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'not json at all' } }],
    })

    const result = await extractResumeData('some resume text')

    expect(result.status).toBe('error')
  })

  it('returns a status:error result when the AI response does not match the schema', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ skills: ['React'], experience: 'not an array' }) } }],
    })

    const result = await extractResumeData('some resume text')

    expect(result.status).toBe('error')
  })
})
