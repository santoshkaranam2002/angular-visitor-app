const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist/visitor-hub/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/visitor-hub/browser/index.html'));
});

// iisnode passes a named pipe via PORT environment variable
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));