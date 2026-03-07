const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);

  // Attempt to open the browser automatically
  const url = `http://localhost:${PORT}`;
  const startCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';

  exec(`${startCommand} ${url}`, (err) => {
    if (err) {
      console.error("Could not open browser automatically.", err);
    }
  });
});
