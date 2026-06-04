<div align="center">

![Nuwault Logo](public/assets/img/logo/nuwault_logo_horizontal_teal_360px.png)

**Advanced keyword-based password generator with client-side security and privacy focus**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.12-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.16-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[Live Demo](https://nuwault.com) • [Documentation](#documentation) • [Features](#features) • [Quick Start](#quick-start)

</div>

## Overview

Nuwault is a secure, privacy-focused password generator that creates deterministic passwords from your keywords. All password generation happens client-side using our advanced [@nuwax-io/nuwault-core](https://github.com/nuwax-io/nuwault-core) algorithm library.

### Why Nuwault?

- **Client-Side Security**: All processing happens in your browser
- **Deterministic**: Same keywords always generate the same password
- **No Storage**: Passwords are generated on-demand, never stored
- **Progressive Web App**: Install as a native app on any device
- **Works Offline**: No internet connection required after installation (requires browser cache enabled)

## Features

### Core Functionality
- **Keyword-Based Generation**: Use memorable keywords to create secure passwords
- **Real-time Strength Analysis**: Advanced password strength meter with detailed feedback
- **Granular Symbol Types**: 7 independently toggleable symbol categories — Logograms, Math, Braces, Dashes & Slashes, Punctuation, Quotes, Extended ASCII (46 chars)
- **Exclude Look-alike Characters**: Option to remove visually ambiguous characters (`0 1 l I O | . B 9 G 6`) from all active sets
- **Customizable Options**: Configure length, character types, and complexity
- **Multi-language Support**: Available in multiple languages

### Security Features
- **Advanced Algorithm**: Uses [@nuwax-io/nuwault-core](https://github.com/nuwax-io/nuwault-core) for cryptographically secure generation
- **Client-Side Only**: Your data never leaves your device
- **Deterministic Generation**: Same inputs always produce same outputs
- **No Network Requests**: Complete privacy protection

### Progressive Web App
- **Offline Functionality**: Full functionality without internet (requires browser cache enabled)
- **Native Experience**: App-like interface and behavior
- **Cross-Platform**: Works on desktop, mobile, and tablets
- **Auto-Updates**: Seamless updates in the background

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/nuwax-io/nuwault-web.git
cd nuwault

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:pwa        # Build with PWA optimization
npm run preview          # Preview production build
npm run pwa:setup        # Setup PWA features
```

**Note**: After first build, the app works offline if browser cache is enabled. Private/incognito mode may prevent offline functionality.

## Symbol Type Configuration

The password generator exposes fine-grained control over symbol characters via 7 independent categories:

| Category | Characters | Default |
|---|---|---|
| Logograms | `#$%&@^` `` ` `` `~` | ✅ On |
| Math | `<>*+!?=` | ✅ On |
| Braces | `{[()]}` | ✅ On |
| Dashes & Slashes | `\/\|_-` | ✅ On |
| Punctuation | `.,:;` | ✅ On |
| Quotes | `"'` | ❌ Off |
| Extended ASCII | `½©²±æçüÁ…` (46 chars) | ❌ Off |

**Backward compatibility**: when the default selection is active, the generator passes the original `!@#$%^&*()_+-=[]{}|;:,.<>?` symbol string to `nuwault-core` unchanged — previously generated passwords are unaffected. Custom selections produce a new combined charset.

**Exclude look-alike characters** (`0 1 l I O | . B 9 G 6`) is an opt-in option that filters ambiguous characters from all active sets (uppercase, lowercase, numbers, and symbols).

> All character set logic lives in `src/utils/config.js` (`SYMBOL_GROUPS`, `buildSymbolsCharset`, `buildCharacterSets`). The core package receives the final charset via the `characterSets` parameter of `generatePassword()`.

## Password Generation Algorithm

Nuwault uses the **[@nuwax-io/nuwault-core](https://github.com/nuwax-io/nuwault-core)** library for secure password generation. This advanced algorithm ensures deterministic, secure, and balanced password creation.

### Algorithm Overview

#### Core Process
1. **Input Validation**: Validates and sanitizes input strings
2. **Normalization**: Converts inputs to lowercase, removes diacritics
3. **Hash Generation**: Multiple SHA-512 iterations with unique salts
4. **Character Distribution**: Advanced algorithms for balanced output
5. **Deterministic Shuffle**: Consistent results across generations

#### Character Distribution
The library uses sophisticated algorithms to ensure balanced character distribution with minimal repetition:

- **Adaptive Distribution**: Different strategies based on password length
- **Character Repetition Control**: Dynamic maximum repetition limits
- **Intelligent Character Selection**: Multi-layer selection algorithm
- **Character Diversity Optimization**: Maximizes unique character usage
- **Weighted Selection**: Symbols and numbers get higher priority in longer passwords
- **Deterministic Shuffle**: Fisher-Yates shuffle using hash entropy for consistent results

#### Hash Generation Security
- **Multiple Iterations**: Configurable iterations (default: 1000) prevent rainbow table attacks
- **Unique Salt per Iteration**: Each iteration uses a unique salt combining master salt, iteration counter, and previous hash
- **Master Salt Integration**: When provided, prepended to every iteration for unique password variants
- **Timing Attack Prevention**: Small delays during first iteration
- **Input Entropy Validation**: Minimum combined input length requirements

### Security & Validation

#### Security Features
- **Multiple Hash Iterations**: Configurable iterations (default: 1000) to prevent rainbow table attacks
- **Optional Master Salt**: User-provided master salt for additional security (null by default)
- **Unique Salt per Iteration**: Each hash iteration uses a unique salt combining master salt, iteration counter, and previous hash
- **Timing Attack Prevention**: Small delays during hash generation
- **Input Validation**: Comprehensive validation and sanitization
- **Deterministic Generation**: Same inputs always produce the same password

#### Algorithm Validation
The library includes comprehensive validation systems to ensure algorithm consistency across different environments, platforms, and library versions.

#### Stability Guarantees
- **Deterministic Behavior**: Same inputs always produce identical outputs across all platforms
- **Version Compatibility**: Algorithm versioning prevents breaking changes
- **Platform Independence**: Identical results on Node.js vs. Browser vs. Electron across different OS
- **Future-Proof Design**: SHA-512 algorithm standardized by NIST (FIPS 180-4)

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), no frameworks
- **Algorithm**: [@nuwax-io/nuwault-core](https://github.com/nuwax-io/nuwault-core) for secure password generation
- **Styling**: Tailwind CSS 4 with utility-first approach
- **Build Tool**: Vite 8 — separate JS + CSS bundles for efficient service worker caching
- **PWA**: Service Worker, Web App Manifest (`id`, `display_override`, maskable icons)
- **Security**: Web Crypto API, strict CSP (`script-src 'self'`, no `unsafe-inline`)
- **Internationalization**: i18next for multi-language support (English, Turkish)

## Project Structure

```
src/
├── components/         # UI components
├── password/           # Password generation logic
├── utils/              # Utility functions
├── styles/             # Modular CSS architecture
├── locales/            # Language files
└── templates/          # Service worker templates
```

## Security Architecture

### Password Generation Process
1. **Input Processing**: Keywords are normalized and validated
2. **Algorithm Execution**: [@nuwax-io/nuwault-core](https://github.com/nuwax-io/nuwault-core) handles cryptographic operations
3. **Deterministic Output**: Same inputs always produce same results
4. **Client-Side Only**: No network communication required

### Security Guarantees
- **No Data Transmission**: All processing happens locally
- **No Storage**: Passwords are never stored anywhere
- **Deterministic**: Reproducible results from same inputs
- **Cryptographically Secure**: Uses Web Crypto API standards
- **Algorithm Validation**: Comprehensive compatibility checks
- **Offline Security**: Complete functionality without network (requires browser cache support)

## Security Policy

We take security seriously and appreciate responsible disclosure of vulnerabilities. For detailed security information, vulnerability reporting procedures, and security best practices, please see our [Security Policy](SECURITY.md).

### Security Overview
- **Secure by Design**: SHA-512 hashing with multiple iterations
- **Deterministic Generation**: Consistent, predictable outputs
- **Input Validation**: Comprehensive validation and sanitization
- **Timing Attack Resistance**: Protected against timing-based attacks
- **Memory Safety**: Best-effort secure memory handling

### Reporting Vulnerabilities
**Please do not report security vulnerabilities via GitHub issues.**

For security vulnerabilities, please:
- Email: [security@nuwault.com](mailto:security@nuwault.com)
- Follow our coordinated disclosure process
- Receive acknowledgment within 48 hours

**[Complete Security Policy](SECURITY.md)**

## Password Strength Analysis

The built-in strength meter evaluates passwords using:

- **Length Analysis**: Exponential strength increase with length
- **Character Variety**: Uppercase, lowercase, numbers, symbols
- **Entropy Calculation**: Unique character distribution
- **Pattern Detection**: Identifies and penalizes weak patterns

### Strength Levels
- **Very Weak** (0-17): Critical security risk
- **Weak** (18-34): Security risk present  
- **Moderate** (35-54): Acceptable level
- **Strong** (55-74): Good security level
- **Very Strong** (75-100): Excellent security

## Documentation

- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Password Strength Guide](docs/PASSWORD-STRENGTH.md)
- [PWA Setup Guide](docs/PWA-SETUP.md)

## Browser Support

- **Chrome 88+**: Full PWA support with offline functionality
- **Firefox 85+**: Core functionality with offline support
- **Safari 14+**: Limited PWA features, offline support available
- **Edge 88+**: Full PWA support with offline functionality
- **IE11**: Not supported

**Note**: Offline functionality requires browser cache enabled. Private/incognito mode may disable caching.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code standards and style guides
- Security requirements
- Pull request process
- Issue reporting

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/nuwax-io/nuwault-web/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/nuwax-io/nuwault-web/discussions)
- **Security Issues**: [security@nuwault.com](mailto:security@nuwault.com)
- **General Support**: [support@nuwault.com](mailto:support@nuwault.com)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 NuwaX

---

<div align="center">

**Built with ❤️ for password security and privacy**

[⭐ Star this project](https://github.com/nuwax-io/nuwault-web) if you find it useful!

</div> 