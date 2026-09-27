const express = require('express');

const app = express();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
const authRoutes = require('./routes/auth.routes');
const centreRoutes = require('./routes/centre.routes')
const testRoutes=require('./routes/test.routes')
const bookingRoutes = require('./routes/booking.routes')
const paymentRoutes = require('./routes/payment-routes')

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/centres',centreRoutes)
app.use('/api/v1',testRoutes);
app.use('/api/v1/bookings',bookingRoutes);
app.use('/api/v1/payments',paymentRoutes);

app.get('/health',(req,res)=>{
    res.status(200).json({ message: "server is up" });
})

module.exports =app;