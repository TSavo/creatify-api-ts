# Contributing to Creatify API TypeScript Client

Thank you for considering contributing to the Creatify API TypeScript Client! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please be respectful and constructive in your communications with other contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome. Please provide:

- A clear and descriptive title
- A detailed description of the proposed enhancement
- An explanation of why this enhancement would be useful

### Pull Requests

- Fill in the required template
- Follow the TypeScript style guide
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline

## Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/creatify-api-ts.git

# Navigate to the project directory
cd creatify-api-ts

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

### TypeScript Styleguide

- Use 2 spaces for indentation
- Prefer const over let
- Use explicit types rather than relying on inference
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use meaningful variable names

## Testing

All new features should include appropriate test cases. Run the test suite with:

```bash
npm test
```

## Documentation

Update the README.md and other documentation with details of changes to the interface or new functionality.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.
