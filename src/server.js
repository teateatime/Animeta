const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Use the cors middleware
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve your JSON data
app.get('/api/anime-facts', (req, res) => {
  const animeFacts = require('./assets/api/anime-facts.json');
  res.json(animeFacts);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
