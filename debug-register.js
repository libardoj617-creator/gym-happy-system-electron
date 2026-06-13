const { startServer } = require('./server');
const fetch = global.fetch || require('node-fetch');

process.env.PORT = '3001';

startServer()
  .then(async () => {
    console.log('Server started for debug');
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'testuser', password: 'testpass' })
      });
      const text = await response.text();
      console.log('Status:', response.status);
      console.log('Body:', text);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
