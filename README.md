# YOQR - Free QR Code Generator & Scanner

![YOQR Logo](public/favicon.svg)

A modern, privacy-focused QR code generator and scanner built with Next.js, TypeScript, and Tailwind CSS. Create professional QR codes with advanced customization options and scan them instantly with your camera.

## 🌟 Features

### QR Code Generation
- **Multiple Content Types**: URL, Text, WiFi, Contact, Email, SMS, Geo Location, Phone
- **Advanced Customization**:
  - Colors (Foreground & Background)
  - Gradient backgrounds
  - Patterns (Dots, Grid, Diagonal, Checker, Stripes)
  - Container styles (Square, Rounded, Circle)
  - Border width and drop shadows
  - Logo embedding (multiple logos supported)
  - Animations (Pulse, Glow, Scan effects)
- **Real-time Preview**: See changes instantly
- **High-Resolution Export**: PNG, SVG, JPEG formats
- **Template System**: Save and load custom templates

### QR Code Scanning
- **Camera Integration**: Scan QR codes with device camera
- **Continuous Scan Mode**: Scan multiple codes automatically
- **Multiple Camera Support**: Switch between front/back cameras
- **Scan History**: View and manage scanned codes
- **Export Options**: CSV export of scan history

### Privacy & Security
- **Zero Data Collection**: No tracking, no analytics
- **Client-side Processing**: All operations happen in your browser
- **No Account Required**: Use immediately without registration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Shubhamnpk/yoqr.git
cd yoqr
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **QR Generation**: qrcode.react
- **QR Scanning**: html5-qrcode
- **Image Processing**: html2canvas
- **Icons**: Lucide React
- **Deployment**: Netlify

## 📱 Progressive Web App (PWA)

YOQR is a PWA that can be installed on your device for offline functionality:

- Install banner appears automatically
- Works offline for basic operations
- Native app-like experience
- Fast loading and responsive design

## 🎨 Customization Options

### Colors & Themes
- Light/Dark mode support
- Custom color palettes
- Gradient backgrounds
- Theme persistence

### QR Code Styles
- Size adjustment (100px - 500px)
- Error correction levels (L, M, Q, H)
- Quiet zone inclusion
- Container styling

### Advanced Features
- Logo embedding with positioning
- Pattern overlays
- Animation effects
- Border and shadow effects

## 🔒 Privacy Policy

YOQR is committed to your privacy:

- **No Data Collection**: We don't store or track any of your data
- **Client-side Only**: All QR code generation and processing happens in your browser
- **No Cookies**: We don't use cookies or tracking pixels
- **Open Source**: Code is publicly available for audit

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit your changes: `git commit -am 'Add your feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the **YoGuru Limited Contributor License** - see the [LICENSE](LICENSE) file for details.

### YoGuru Limited Contributor License

**Version v3, [2025]**

1. **License Grant**

   This license empowers individuals or entities (the "Contributor") to contribute to the evolution of YoGuru software (the "Software"). Contributions are embraced under these terms, with the Contributor maintaining copyright ownership.

2. **Contributions**

   Contributions are welcome, provided they adhere to the principles set forth in this license. All contributions must be original and not infringe on any third-party rights.

3. **Limited Permissions**

   a. **Commercial Use:** Exclusive rights for commercial use, including advertising, are granted solely to the original copyright holder. Contributors and users are expressly prohibited from any commercial utilization without explicit written permission.

   b. **Redistribution:** Modified or unmodified versions of the Software can be shared under the terms of this license, provided that all copies retain this license and attribution to the original copyright holder.

   c. **Modification:** Contributors can modify the Software for personal or internal use only. Public distribution or commercial use of modified versions requires explicit written permission from the original copyright holder.

   d. **Sublicensing:** Sublicensing the Software or any part thereof is not permitted without explicit written permission from the original copyright holder.

4. **Rights Reserved**

   The original copyright holder reserves the right to:

   a. Modify these terms, with updates applying to new contributions.

   b. Exercise sole discretion in accepting or rejecting contributions.

5. **Attribution**

   Contributors will be acknowledged for their contributions in the Software's documentation or other appropriate channels. Attribution must be clear and visible in any distributed versions of the Software.

6. **Warranty and Liability**

   a. **No Warranty:** The Software is provided "as is," without any warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

   b. **Limitation of Liability:** The original copyright holder holds no liability for any claims, damages, or other liabilities, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the Software or the use or other dealings in the Software.

7. **Governing Law**

   This license is governed by the laws of Nepal and the USA. Any disputes arising under or in connection with this license shall be resolved in accordance with the applicable laws of these jurisdictions.

8. **Compliance with Local Laws**

   Contributors must ensure that their contributions comply with all applicable local, state, and federal laws and regulations, including but not limited to intellectual property laws, export control laws, and data protection regulations in both Nepal and the USA.

9. **Enforcement and Legal Consequences**

   a. **Breach of License:** Any breach of the terms of this license by the Contributor will result in immediate termination of their rights under this license.

   b. **Legal Action:** The original copyright holder reserves the right to pursue legal action against any Contributor who violates the terms of this license. This includes seeking damages, injunctive relief, and any other remedies available under the law.

   c. **Indemnification:** Contributors agree to indemnify and hold harmless the original copyright holder from any claims, damages, or liabilities arising from their contributions or use of the Software.

10. **Miscellaneous**

    a. **Entire Agreement:** This license constitutes the full agreement between the Contributor and the original copyright holder.

    b. **Severability:** If any provision of this license is found to be unenforceable or invalid, the remaining provisions remain effective.

    c. **No Waiver:** Failure by the original copyright holder to enforce any provision of this license shall not be deemed a waiver of future enforcement of that or any other provision.

    d. **Headings:** The headings used in this license are for convenience only and have no legal or contractual effect.

By contributing to YoGuru, the Contributor agrees to adhere to the terms of this license.

[Shubham Niraula]  
[9842440053]

## 📞 Contact

- **Developer**: Bit Nepal
- **Website**: [https://www.bit-nepal.com/](https://www.bit-nepal.com/)
- **GitHub**: [https://github.com/Shubhamnpk/yoqr](https://github.com/Shubhamnpk/yoqr)
- **Email**: Contact through website

## 🙏 Acknowledgments

- Built with ❤️ in Nepal
- Special thanks to the open source community
- Icons by [Lucide](https://lucide.dev/)
- UI components by [Radix UI](https://www.radix-ui.com/)

---

**Made with ❤️ by Bit Nepal - Technology company based in Nepal**