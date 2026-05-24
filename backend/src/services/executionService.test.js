const { getSupportedLanguages } = require('./executionService');

describe('Execution Service', () => {
  test('should return supported languages list', () => {
    const languages = getSupportedLanguages();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);

    const python = languages.find(l => l.id === 'python');
    expect(python).toBeDefined();
    expect(python.name).toBe('Python');
    expect(python.extension).toBe('.py');
  });
});
