const app = require('./app');
const connectDB  = require('./connection/database');
const express = require('express');

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

connectDB();
