import { extractResumeData } from '@/agents/resumeExtractor'

// Mock the Groq SDK
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    skills: ['JavaScript', 'React'],
                    experience: '5 years of frontend development',
                    education: 'BS in Computer Science'
                  })
                }
              }
            ]
          })
        }
      }
    };
  });
});

describe('resumeExtractor AI Agent', () => {
  it('should successfully parse text and return a valid JSON structure', async () => {
    const fakeRawText = "John Doe\nFrontend Developer\nSkills: JavaScript, React\nExperience: 5 years of frontend development\nEducation: BS in Computer Science";
    
    const result = await extractResumeData(fakeRawText);
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('skills');
    expect(result).toHaveProperty('experience');
    expect(Array.isArray(result?.skills)).toBe(true);
    expect(result?.skills[0]).toBe('JavaScript');
  });
});
