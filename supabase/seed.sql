-- ============================================================
-- Campus Opportunity Hub — Seed Data (Development Only)
-- ============================================================

INSERT INTO public.opportunities (
  company, role, type, salary, location, eligibility, skills,
  responsibilities, interview_process, instructions, apply_link,
  deadline, featured, is_published, tags, views_count
) VALUES
(
  'Google India',
  'Software Engineer – New Grad 2025',
  'placement',
  '₹45–55 LPA',
  'Bangalore / Hyderabad',
  '{"branches": ["CSE", "IT", "ECE"], "cgpa": "7.5 and above", "backlog": "No backlogs", "batch": "2025 passout", "other": null}',
  ARRAY['Data Structures', 'Algorithms', 'System Design', 'Python', 'Java', 'C++'],
  ARRAY[
    'Design and develop scalable backend services',
    'Collaborate with cross-functional teams',
    'Write high-quality, tested code',
    'Participate in code reviews'
  ],
  '{"rounds": 4, "description": ["Online Assessment (DSA)", "Technical Interview 1 (DSA + Problem Solving)", "Technical Interview 2 (System Design)", "HR / Googleyness Round"]}',
  'Register via your campus TPO. Bring updated resume. Dress code: Business casual.',
  'https://careers.google.com',
  NOW() + INTERVAL '15 days',
  true,
  true,
  ARRAY['FAANG', 'product', 'freshers', '2025-batch'],
  342
),
(
  'Microsoft',
  'Software Development Engineer Intern',
  'internship',
  '₹1,00,000/month',
  'Hyderabad (On-site)',
  '{"branches": ["CSE", "IT", "MCA"], "cgpa": "7.0 and above", "backlog": "No active backlogs", "batch": "2026 passout", "other": null}',
  ARRAY['C#', '.NET', 'Azure', 'Data Structures', 'Algorithms'],
  ARRAY[
    'Build features for Microsoft 365 products',
    'Write unit and integration tests',
    'Work with senior engineers on production systems'
  ],
  '{"rounds": 3, "description": ["Online Coding Test", "Technical Interview (DSA + OOP)", "HR Interview"]}',
  'Apply only through your college TPO portal. Do not apply directly.',
  'https://careers.microsoft.com',
  NOW() + INTERVAL '8 days',
  true,
  true,
  ARRAY['FAANG', 'stipend', 'MNC', '2026-batch'],
  218
),
(
  'Smart India Hackathon 2025',
  'Participant – SIH Grand Finale',
  'hackathon',
  '₹1 Lakh prize pool',
  'Pan India (Multiple venues)',
  '{"branches": ["CSE", "IT", "ECE", "ME", "CE", "All branches"], "cgpa": null, "backlog": null, "batch": "All batches", "other": "Team of 6 members required"}',
  ARRAY['Problem Solving', 'Teamwork', 'Any Programming Language', 'Innovation'],
  ARRAY[
    'Solve real government problem statements',
    'Build a working prototype in 36 hours',
    'Present solution to a panel of judges'
  ],
  '{"rounds": 2, "description": ["Internal College Round", "Grand Finale (36-hour hackathon)"]}',
  'Form a team of 6. Register on sih.gov.in. One team per problem statement per college.',
  'https://sih.gov.in',
  NOW() + INTERVAL '5 days',
  false,
  true,
  ARRAY['freshers', 'competition', 'startup'],
  156
),
(
  'Tata Capital',
  'LAMP Fellowship – Leadership & Management Program',
  'fellowship',
  '₹70,000/month stipend',
  'Mumbai, Delhi, Bangalore',
  '{"branches": ["All branches"], "cgpa": "6.5 and above", "backlog": "No active backlogs", "batch": "2025 passout", "other": "MBA aspirants preferred"}',
  ARRAY['Leadership', 'Communication', 'Analytics', 'Finance Basics'],
  ARRAY[
    'Rotate across 4 business functions in 12 months',
    'Work on live projects with C-suite mentorship',
    'Develop leadership and business acumen'
  ],
  '{"rounds": 3, "description": ["Aptitude & Case Test", "Group Discussion", "Executive Interview"]}',
  null,
  'https://www.tatacapital.com/careers',
  NOW() + INTERVAL '20 days',
  false,
  true,
  ARRAY['fellowship', 'MBA', 'MNC', 'stipend'],
  89
),
(
  'KVPY – Kishore Vaigyanik Protsahan Yojana',
  'Science Scholarship 2025',
  'scholarship',
  '₹5,000/month + Annual contingency',
  'All India',
  '{"branches": ["Science (PCM/PCB)"], "cgpa": null, "backlog": null, "batch": "Class 11, 12, BSc 1st year", "other": "Indian nationals only"}',
  ARRAY['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  null,
  '{"rounds": 2, "description": ["Written Aptitude Test", "Personal Interview"]}',
  'Apply at kvpy.iisc.ac.in. Upload all required documents in PDF format.',
  'https://kvpy.iisc.ac.in',
  NOW() + INTERVAL '30 days',
  false,
  true,
  ARRAY['scholarship', 'PSU', 'freshers'],
  67
);
