const express = require('express')
const {
    getKomik,
    getChapter,
    searchKomik,
    getHome,
    daftarPustaka,
} = require('../../controllers/v1/komiku')
const cache = require('../../middleware/cache')

const router = express.Router()

// router.get('/', getHome)
router
    .route('/')
    .get(getHome)

router
    .route('/daftar-komik')
    .get(daftarPustaka)

router
    .route('/search')
    .get(searchKomik)

router
    .route('/:slug')
    .get(getKomik)

router
    .route('/ch/:slug')
    .get(getChapter)


module.exports = router