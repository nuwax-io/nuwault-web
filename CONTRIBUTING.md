# Contributing to Nuwault

Thank you for your interest in contributing to Nuwault! We welcome contributions from the community to help build a secure, privacy-focused password generator.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Coding Standards](#coding-standards)
- [Security Requirements](#security-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Git** for version control
- Modern web browser for testing

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nuwault.git
   cd nuwault
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Verify Setup**
   - Open `http://localhost:5173`
   - Test password generation functionality
   - Verify PWA features work correctly

## Contribution Guidelines

### Types of Contributions

- **Bug Fixes**: Resolve existing issues
- **Feature Additions**: Implement new functionality
- **Documentation**: Improve or add documentation
- **Security Improvements**: Enhance security measures
- **Performance Optimizations**: Improve application performance

### Workflow

1. **Check Issues**: Search existing issues to avoid duplicates
2. **Create Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Follow coding standards and test thoroughly
4. **Commit**: Use conventional commit format
5. **Submit PR**: Create a pull request with clear description

## Coding Standards

### JavaScript

- **Modern ES6+**: Use contemporary JavaScript features
- **Vanilla JavaScript**: No external frameworks
- **JSDoc**: Document all functions with proper JSDoc comments
- **Error Handling**: Implement comprehensive error handling

```javascript
/**
 * Generates secure password from keywords
 * @param {string[]} keywords - User-provided keywords
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated password
 */
async function generatePassword(keywords, options = {}) {
  // Implementation
}
```

### CSS Architecture

Following our modular CSS structure:

- **Modular Structure**: CSS is organized into logical modules
- **Tailwind Utilities**: Prefer utility classes over custom CSS
- **Mobile-First**: Responsive design approach
- **Component Isolation**: Keep component styles separated

```
src/styles/
├── base.css           # Core styles and configuration
├── theme.css          # Color themes and variables
├── utilities.css      # Layout and utility classes
├── components.css     # Reusable component styles
├── password-generator.css  # Password generator specific
├── keyword-chips.css  # Keyword functionality
├── user-guide.css     # User guide carousel
├── dropdowns.css      # Dropdown components
└── responsive.css     # Mobile responsive styles
```

### Code Style

- **Indentation**: 2 spaces
- **Line Length**: 100 characters maximum
- **Naming**: camelCase for variables, PascalCase for components
- **File Organization**: Group related functionality together

### Commit Messages

Follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

- Detailed description of changes
  - File: path/to/file
    - Change: Specific change description
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `security`

## Security Requirements

Security is paramount in Nuwault. All contributions must adhere to:

### Core Security Principles

- **Client-Side Only**: All password generation remains client-side
- **No Data Transmission**: No user data sent to external servers
- **Web Crypto API**: Use browser-native cryptographic functions only
- **Secure Defaults**: Implement secure configurations by default

### Security Checklist

- [ ] Input validation implemented
- [ ] XSS prevention measures applied
- [ ] No hardcoded secrets or sensitive data
- [ ] Cryptographically secure random generation
- [ ] Dependencies security audited

## Pull Request Process

### Before Submitting

1. **Testing**: Verify all functionality works correctly
2. **Code Review**: Self-review for quality and security
3. **Documentation**: Update relevant documentation
4. **Performance**: Ensure no performance regressions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Security enhancement

## Testing Completed
- [ ] Manual testing
- [ ] Cross-browser compatibility
- [ ] PWA functionality
- [ ] Security review

## Files Changed
- List modified files and their purposes
```

### Review Requirements

- At least one maintainer approval
- All automated checks must pass
- Security implications reviewed
- Performance impact assessed

## Issue Reporting

### Bug Reports

```markdown
**Description**: Clear description of the issue
**Steps to Reproduce**: Numbered steps to recreate
**Expected vs Actual**: What should happen vs what happens
**Environment**: Browser, OS, version information
**Screenshots**: If applicable
```

### Feature Requests

```markdown
**Feature**: Clear description of proposed feature
**Use Case**: Why this feature is needed
**Implementation**: Suggested approach
**Security Impact**: Any security considerations
```

## Project Structure

```
src/
├── components/        # UI components (Header, Footer, etc.)
├── password/         # Password generation logic
├── utils/           # Utility functions and helpers
├── locales/         # Internationalization files
├── styles/          # Modular CSS architecture
├── templates/       # Service worker and PWA templates
├── main.js          # Application entry point
└── style.css        # Main CSS import file
```

## Testing Requirements

### Browser Compatibility

Test on:
- **Chrome** 88+
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

### Testing Checklist

- [ ] Password generation functionality
- [ ] Character set options work correctly
- [ ] Password strength calculation accurate
- [ ] PWA features work offline
- [ ] Responsive design on all screen sizes
- [ ] No console errors or warnings
- [ ] Accessibility requirements met

## Community Guidelines

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **Email**: support@nuwault.com for security concerns
- **Repository**: https://github.com/nuwax-io/nuwault-web

### Code of Conduct

- Use respectful and inclusive language
- Accept constructive feedback gracefully
- Focus on community benefit
- Maintain professional interactions

## Recognition

Contributors are acknowledged in:
- Release notes and changelogs
- README.md contributor section
- GitHub contributor statistics

## License

By contributing to Nuwault, you agree that your contributions will be licensed under the GNU General Public License v3.0 (GPL-3.0).

---

For questions about contributing, please check existing documentation and issues first, then create a new issue or contact us at support@nuwault.com.

Thank you for helping make Nuwault better! 🔐 