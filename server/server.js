const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connect();

(async () => {
    const server = app.listen(PORT, () => {
        const address = server.address();

        
        console.log(`Server is running on port ${PORT}`);
    });
})().catch((err) => {
    console.error('Error starting server:', err);
});