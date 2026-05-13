/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: '/resume-builder', destination: '/cv/new', permanent: true },
      { source: '/free-resume-builder', destination: '/cv/new', permanent: true },
      { source: '/resume-template', destination: '/template-gallery', permanent: true },
      { source: '/resume-examples', destination: '/blog', permanent: true },
      { source: '/ats-friendly-resume', destination: '/ats-resume-checker', permanent: true },
      { source: '/resume-format', destination: '/blog/best-resume-format-for-job-seekers', permanent: true },
      { source: '/how-to-write-a-resume', destination: '/blog/how-to-write-a-resume-in-2026', permanent: true },
      { source: '/entry-level-resume-example', destination: '/blog/entry-level-resume-example-no-experience', permanent: true },
      { source: '/internship-resume-example', destination: '/blog/internship-resume-example-for-students', permanent: true },
      { source: '/student-resume-example', destination: '/blog/student-resume-example-for-first-job', permanent: true },
      { source: '/software-engineer-resume-example', destination: '/blog/software-engineer-resume-example', permanent: true },
      { source: '/cover-letter-examples', destination: '/blog/cover-letter-examples-by-job-title', permanent: true },
      { source: '/resume-objective-examples', destination: '/blog/resume-objective-examples-for-beginners', permanent: true },
      { source: '/resume-summary-examples', destination: '/blog/resume-summary-examples-by-industry', permanent: true },
      { source: '/resume-skills-examples', destination: '/blog/resume-skills-examples-employers-want', permanent: true },
    ];
  },
};

export default nextConfig;
