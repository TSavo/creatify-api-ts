import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('semantic-release configuration', () => {
  it('should have a valid configuration file', () => {
    const configPath = path.resolve('.releaserc.json');
    const fileExists = fs.existsSync(configPath);
    
    expect(fileExists).toBe(true);
  });
});
