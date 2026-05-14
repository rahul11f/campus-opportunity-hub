import { Opportunity } from '@/types/opportunity';

export function JobPostingJsonLd({ opportunity }: { opportunity: Opportunity }) {
  const isJobType = opportunity.type === 'placement' || opportunity.type === 'internship' || opportunity.type === 'campus_drive';

  if (!isJobType) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: opportunity.role,
    description: [
      opportunity.eligibility?.branches?.length
        ? `Eligible branches: ${opportunity.eligibility.branches.join(', ')}`
        : '',
      opportunity.eligibility?.cgpa ? `CGPA: ${opportunity.eligibility.cgpa}` : '',
      opportunity.skills?.length ? `Skills: ${opportunity.skills.join(', ')}` : '',
      ...(opportunity.responsibilities || []),
    ]
      .filter(Boolean)
      .join('. '),
    hiringOrganization: {
      '@type': 'Organization',
      name: opportunity.company,
      sameAs: opportunity.apply_link || undefined,
    },
    jobLocation: opportunity.location
      ? {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: opportunity.location,
            addressCountry: 'IN',
          },
        }
      : undefined,
    baseSalary: opportunity.salary
      ? {
          '@type': 'MonetaryAmount',
          currency: 'INR',
          value: {
            '@type': 'QuantitativeValue',
            value: opportunity.salary,
          },
        }
      : undefined,
    employmentType:
      opportunity.type === 'internship' ? 'INTERN' : 'FULL_TIME',
    datePosted: opportunity.created_at,
    validThrough: opportunity.deadline || undefined,
    applicationContact: opportunity.apply_link
      ? {
          '@type': 'ContactPoint',
          url: opportunity.apply_link,
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
