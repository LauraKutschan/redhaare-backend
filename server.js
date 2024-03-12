const express = require('express');
const cors = require('cors');
const imagesRoutes = require('./routes/media.routes');
const instagramRoutes = require('./routes/instagram.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/media', imagesRoutes);
app.use('/instagram', instagramRoutes);

// Start server
app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server running on http://localhost:${PORT}`);
    }
});
