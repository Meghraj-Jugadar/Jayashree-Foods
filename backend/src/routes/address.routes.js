const router = require('express').Router();
const { getAddresses, createAddress, updateAddress, deleteAddress, setDefault } = require('../controllers/address.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefault);

module.exports = router;
