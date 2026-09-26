const express = require('express');

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/auth.routes');
const centreRoutes = require('./routes/centre.routes')
const testRoutes=require('./routes/test.routes')

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/centres',centreRoutes)
app.use('/api/v1',testRoutes);

app.get('/health',(req,res)=>{
    res.status(200).json({ message: "server is up" });
})

module.exports =app;