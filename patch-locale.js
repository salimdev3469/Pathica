const fs = require('fs');

const filesToPatch = [
  'app/page.tsx',
  'components/home/HomeCinematicExperience.tsx',
  'components/home/TemplateLibraryGrid.tsx',
  'components/layout/SiteFooter.tsx',
  'components/dashboard/AiReviewDashboard.tsx',
  'components/seo/ProgrammaticProfessionListPage.tsx',
  'components/seo/SeoLandingPage.tsx',
  'components/seo/ProgrammaticProfessionDetailPage.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace standalone isTr
  content = content.replace(/\bisTr\b/g, 'false');
  
  // Replace locale conditions
  content = content.replace(/locale\s*===\s*'tr'/g, 'false');
  content = content.replace(/locale\s*===\s*"tr"/g, 'false');
  content = content.replace(/locale\s*===\s*'en'/g, 'true');
  content = content.replace(/locale\s*===\s*"en"/g, 'true');
  
  // Replace other locale usages safely
  content = content.replace(/\[locale\]/g, "['en']");
  content = content.replace(/\(locale\)/g, "('en')");
  content = content.replace(/\(locale,/g, "('en',");
  content = content.replace(/,\s*locale\)/g, ", 'en')");
  content = content.replace(/\{locale\}/g, "{'en'}");
  content = content.replace(/lang=\{locale\}/g, "lang={'en'}");
  content = content.replace(/locale\}/g, "'en'}"); // For `<SiteFooter locale={locale} />` -> `<SiteFooter locale={'en'} />` which my codemod deleted but just in case
  
  // Specifically for <SiteFooter locale={locale} /> in app/layout.tsx if it's there
  
  fs.writeFileSync(file, content, 'utf8');
}

// Let's also patch app/layout.tsx just in case
let layoutPath = 'app/layout.tsx';
if (fs.existsSync(layoutPath)) {
  let content = fs.readFileSync(layoutPath, 'utf8');
  content = content.replace(/\bisTr\b/g, 'false');
  content = content.replace(/locale=\{locale\}/g, "locale={'en'}");
  fs.writeFileSync(layoutPath, content, 'utf8');
}
