const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3001;


(async () => {
    const server = app.listen(PORT, () => {
        const address = server.address();

        console.log(address);
        console.log(`Server is running on port ${PORT}`);
    });
})().catch((err) => {
    console.error('Error starting server:', err);
});