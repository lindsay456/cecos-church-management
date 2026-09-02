const http = require('http');
const fs = require('fs');
const path = require('path');

// Fetch main.js and search for potential issues
http.get('http://localhost:4200/main.js', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('main.js size:', data.length, 'bytes');
    
    // Check for common error patterns
    const patterns = [
      { name: 'NullInjectorError', re: /NullInjectorError/g },
      { name: 'Cannot match', re: /Cannot match any routes/g },
      { name: 'provideAnimations', re: /provideAnimations/g },
      { name: 'BrowserModule', re: /BrowserModule/g },
      { name: 'bootstrapApplication', re: /bootstrapApplication/g },
    ];
    
    patterns.forEach(p => {
      const matches = data.match(p.re);
      console.log(p.name + ':', matches ? matches.length + ' occurrences' : 'NOT FOUND');
    });

    // Check if all component selectors exist
    const selectors = ['app-login', 'app-register', 'app-dashboard', 'app-layout',
      'app-members', 'app-families', 'app-chapels', 'app-departments',
      'app-events', 'app-attendance', 'app-visitors', 'app-finance',
      'app-donations', 'app-redistribution', 'app-pastoral', 'app-reports',
      'app-audit', 'app-settings', 'app-profile'];
    
    selectors.forEach(s => {
      const found = data.includes(s);
      if (!found) console.log('MISSING selector:', s);
    });
    console.log('All selectors checked.');
  });
}).on('error', (e) => {
  console.error('Error fetching main.js:', e.message);
});
