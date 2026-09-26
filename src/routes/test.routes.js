const express = require('express');

const {
    createTest,
    getTestsByCentre,
    getTestById,
    updateTest,
    deleteTest
} = require('../controllers/test.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/centres/:centreId/tests', createTest);
router.get('/centres/:centreId/tests', getTestsByCentre);

router.get('/tests/:id', getTestById);
router.patch('/tests/:id', updateTest);
router.delete('/tests/:id', deleteTest);
module.exports = router;