import { SoftwareApplication, WebApplication, HowTo, FAQPage, Organization } from 'schema-dts';

const YOQRStructuredData = () => {
  const softwareAppSchema: SoftwareApplication = {
    '@type': 'SoftwareApplication',
    name: 'YOQR - Free QR Code Generator & Scanner',
    description: 'The most powerful free QR code generator and scanner. Create custom QR codes for URLs, text, WiFi, contacts, and more. Scan QR codes instantly with your camera. Privacy-focused, no data collection.',
    url: 'https://yoqr.netlify.app',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1'
    },
    creator: {
      '@type': 'Organization',
      name: 'Bit Nepal',
      url: 'https://www.bit-nepal.com/'
    },
    featureList: [
      'QR Code Generation',
      'QR Code Scanning',
      'Custom QR Codes',
      'Logo Embedding',
      'Multiple QR Types',
      'Privacy Focused',
      'No Registration Required',
      'Offline Functionality'
    ]
  };

  const webAppSchema: WebApplication = {
    '@type': 'WebApplication',
    name: 'YOQR',
    url: 'https://yoqr.netlify.app',
    description: 'Free online QR code generator and scanner with advanced customization options',
    applicationCategory: 'BusinessApplication',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    screenshot: 'https://yoqr.netlify.app/og-image.jpg',
    softwareVersion: '1.5.1'
  };

  const howToSchema: HowTo = {
    '@type': 'HowTo',
    name: 'How to Generate a QR Code with YOQR',
    description: 'Step-by-step guide to create custom QR codes for free',
    image: 'https://yoqr.netlify.app/og-image.jpg',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Choose QR Code Type',
        text: 'Select from URL, Text, WiFi, Contact, Email, SMS, Geo Location, or Phone',
        image: 'https://yoqr.netlify.app/og-image.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Enter Your Content',
        text: 'Fill in the required information for your selected QR code type',
        image: 'https://yoqr.netlify.app/og-image.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Customize Design',
        text: 'Choose colors, patterns, add logo, and adjust appearance',
        image: 'https://yoqr.netlify.app/og-image.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Download QR Code',
        text: 'Export your QR code in PNG, SVG, or JPEG format',
        image: 'https://yoqr.netlify.app/og-image.jpg'
      }
    ]
  };

  const faqSchema: FAQPage = {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is YOQR really free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! YOQR is completely free with no hidden costs, registration requirements, or usage limits.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does YOQR collect any personal data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. YOQR is privacy-focused and processes all QR codes locally in your browser. We don\'t track, store, or collect any of your data.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I use YOQR offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! YOQR works offline as a Progressive Web App. You can generate and scan QR codes without an internet connection.'
        }
      },
      {
        '@type': 'Question',
        name: 'What QR code types can I create?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'YOQR supports URL, Text, WiFi, Contact (vCard), Email, SMS, Geo Location, and Phone number QR codes.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I add my logo to QR codes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! YOQR allows you to embed logos and customize the appearance of your QR codes with various patterns and colors.'
        }
      }
    ]
  };

  const organizationSchema: Organization = {
    '@type': 'Organization',
    name: 'Bit Nepal',
    url: 'https://www.bit-nepal.com/',
    logo: 'https://yoqr.netlify.app/favicon.svg',
    description: 'Technology company based in Nepal specializing in web applications and digital solutions',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
      addressLocality: 'Kathmandu'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: 'https://www.bit-nepal.com/'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
};

export default YOQRStructuredData;
