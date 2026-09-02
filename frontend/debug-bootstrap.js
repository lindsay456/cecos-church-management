// Minimal browser env simulation to catch bootstrap errors
const http = require('http');

http.get('http://localhost:4200/main.js', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Search for the actual bootstrap call and surrounding code
    const idx = data.indexOf('bootstrapApplication');
    if (idx !== -1) {
      const start = Math.max(0, idx - 200);
      const end = Math.min(data.length, idx + 500);
      console.log('=== Code around bootstrapApplication ===');
      console.log(data.substring(start, end));
    }
    
    // Check for any top-level errors
    const throwIdx = data.indexOf('throw ');
    if (throwIdx !== -1) {
      console.log('\n=== First throw statement ===');
      console.log(data.substring(Math.max(0, throwIdx - 100), throwIdx + 200));
    }
    
    // Check for the catch in bootstrapApplication
    const catchIdx = data.indexOf('.catch(');
    if (catchIdx !== -1) {
      console.log('\n=== First .catch() ===');
      console.log(data.substring(Math.max(0, catchIdx - 100), catchIdx + 200));
    }
  });
}).on('error', console.error);
