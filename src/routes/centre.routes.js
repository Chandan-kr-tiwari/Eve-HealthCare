const express = require('express');

const {
    createCentre,
    getAllCentres,
    getCentreById,
    updateCentre,
    deleteCentre
} = require('../controllers/centre.controller');

const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router();

router.post('/',authMiddleware, createCentre);

router.get('/',authMiddleware, getAllCentres);

router.get('/:id',authMiddleware, getCentreById);

router.patch('/:id',authMiddleware, updateCentre);

router.delete('/:id',authMiddleware, deleteCentre);

module.exports = router;