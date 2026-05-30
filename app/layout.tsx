import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SoundProvider } from '@/components/SoundProvider';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ChatWidgetMount from '@/components/ChatWidgetMount';
import { SITE_URL, profile, education } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const SITE_DESCRIPTION =
  'Portfolio of Vedanshu Patel — Data Engineer and ML practitioner based in Boston. MS in Computer Science from Northeastern University. Building production data pipelines and agentic systems with Kafka, Spark, Airflow, RAG, and MCP.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vedanshu Patel — Data Engineer & ML Practitioner',
    template: '%s · Vedanshu Patel',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Vedanshu Patel — Portfolio',
  keywords: [
    'Vedanshu Patel',
    'Vedanshu Patel portfolio',
    'data engineer',
    'data engineer portfolio',
    'data scientist',
    'data scientist portfolio',
    'machine learning engineer',
    'ML engineer portfolio',
    'AI engineer',
    'AI engineer portfolio',
    'cloud engineer',
    'cloud engineer portfolio',
    'data engineering',
    'Boston data engineer',
    'Northeastern University',
    'Kafka',
    'Apache Spark',
    'PySpark',
    'Airflow',
    'Snowflake',
    'Databricks',
    'RAG',
    'MCP agents',
    'OpenAI Agents SDK',
    'knowledge graphs',
    'Neo4j',
  ],
  authors: [{ name: profile.name, url: profile.links.github }],
  creator: profile.name,
  publisher: profile.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Vedanshu Patel — Portfolio',
    title: 'Vedanshu Patel — Data Engineer & ML Practitioner',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vedanshu Patel — Data Engineer & ML Practitioner',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: profile.tagline,
  description: SITE_DESCRIPTION,
  email: `mailto:${profile.email}`,
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  sameAs: [profile.links.linkedin, profile.links.github],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Boston',
    addressRegion: 'MA',
    addressCountry: 'US',
  },
  alumniOf: education.map((edu) => ({
    '@type': 'CollegeOrUniversity',
    name: edu.school,
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-background text-foreground font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <SoundProvider>
          <ParticleBackground />
          <Nav />
          <main className="relative">{children}</main>
          <Footer />
          <ChatWidgetMount />
        </SoundProvider>
      </body>
    </html>
  );
}
