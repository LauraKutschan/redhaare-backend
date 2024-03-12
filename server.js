const express = require('express');
const imagesRoutes = require('./routes/media.routes');
const instagramRoutes = require('./routes/instagram.routes');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use('/media', imagesRoutes);
app.use('/instagram', instagramRoutes);

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server running on http://localhost:${PORT}`);
    }
});
