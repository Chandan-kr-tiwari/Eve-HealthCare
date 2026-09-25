const express = require('express');

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

app.get('/health',(req,res)=>{
    res.status(200).json({ message: "server is up" });
})

module.exports =app;