const asyncHandler = require('../../libraries/async')
const axiosService = require('../../libraries/axiosService')
const cheerio = require('cheerio')
const { sendError, sendResponse } = require('../../libraries/rest')
const { findFirst, create } = require('../../database/mysql')

const url = 'https://komiku.id'
const data_url = 'https://data.komiku.id'

const getHome = asyncHandler(async (req, res, next) => {
    try {
        const response = await axiosService(`${url}`)
        const $ = cheerio.load(response)

        let dataArray = []
        $('.ls4').each((i, el) => {
            dataArray.push({
                title: $(el).find('div').attr('class', 'ls4j').find('h4').text().replace(/\n/g, '').trim(),
                url: $(el).find('div').attr('class', 'ls4j').find('h4').find('a').attr('href'),
                latest_chapter: {
                    title: $(el).find('div').find('a').attr('class', 'ls24').eq(2).text().replace(/\n/g, '').trim(),
                    url: $(el).find('div').find('a').attr('class', 'ls24').eq(2).attr('href').replace('/ch/', '').replace('/', ''),
                },
                
            })
        }).get()

        return res.status(200).json(new sendResponse(dataArray))
    } catch (error) {
        next(new sendError(error))
    }
})

const getKomik = asyncHandler(async (req, res, next) => {
    const { slug } = req.params

    const cek = await findFirst('komiks', {
        slug: slug
    })

    // if (cek) {
    //     return res.status(200).json(new sendResponse(cek))
    // }
    
    try {
        const response = await axiosService(`${url}/manga/${slug}`)
        const $ = cheerio.load(response)

        const title = $('h1').text().replace(/\n/g, '').trim().replace('Komik ', '')
        const sub_title = $('.j2').text().replace(/\n/g, '').trim()
        const description = $('.desc').text().replace(/\n/g, '').trim()
        const thumbnail = $('.ims').find('img').attr('src')
        const table = $('.inftable')
        const type = table.find('tr').eq(1).find('td').eq(1).text().replace(/\n/g, '').trim()
        const author = table.find('tr').eq(3).find('td').eq(1).text().replace(/\n/g, '').trim()
        const status = table.find('tr').eq(4).find('td').eq(1).text().replace(/\n/g, '').trim()
        const genres = $('ul.genre').find('li').map((i, el) => {
            return $(el).text().replace(/\n/g, '').trim()
        }).get()
        const chapter_table = $('._3Rsjq')
        const chapters = chapter_table.find('tr').map((i, el) => {
            if (i !== 0) {
                return {
                    title: $(el).find('td').eq(0).find('a').text().replace(/\n/g, '').trim(),
                    url: $(el).find('td').eq(0).find('a').attr('href').replace('/ch/', '').replace('/', ''),
                    date: $(el).find('td').eq(1).text().replace(/\n/g, '').trim()
                }
            }
        }).get()

        chapters.reverse()

        // const komik = await create('komiks', {
        //     user_id: 1,
        //     title: title,
        //     alias: sub_title,
        //     slug: slug,
        //     description: description,
        //     thumbnail: thumbnail,
        //     type: type,
        //     author: author,
        //     status: status,
        //     created_at: new Date(),
        //     updated_at: new Date()
        // })

        let komik = {
            insertId: cek.id
        }

        await Promise.all(genres.map(async (genre) => {
            const cek_genre = await findFirst('genres', {
                name: genre
            })

            if (!cek_genre) {
                const new_genre = await create('genres', {
                    name: genre,
                    slug: genre.toLowerCase().replace(' ', '-'),
                    created_at: new Date(),
                    updated_at: new Date()
                })

                await create('komik_genres', {
                    komik_id: komik.insertId,
                    genre_id: new_genre.insertId,
                })
            }

            const cek_komik_genre = await findFirst('komik_genres', {
                komik_id: komik.insertId,
                genre_id: cek_genre.id
            })

            if (!cek_komik_genre) {
                await create('komik_genres', {
                    komik_id: komik.insertId,
                    genre_id: cek_genre.id,
                })
            }
        }))

        await Promise.all(chapters.map(async (chapter) => {
            const cek_chapter = await findFirst('chapters', {
                komik_id: komik.insertId,
                title: chapter.title,
            })

            if (!cek_chapter) {
                const new_chapter = await create('chapters', {
                    komik_id: komik.insertId,
                    title: chapter.title,
                    slug: chapter.url,
                    created_at: new Date(),
                    updated_at: new Date()
                })
            }
        }))

        return res.status(200).json(new sendResponse({
            title,
            sub_title,
            description,
            thumbnail,
            type,
            author,
            status,
            genres,
            chapters,
        }))
    } catch (error) {
        next(new sendError(error))
    }
})

const getChapter = asyncHandler(async (req, res, next) => {
    const { slug } = req.params

    try {
        const response = await axiosService(`${url}/ch/${slug}`)
        const $ = cheerio.load(response)

        const title = $('#Judul').find('h1').eq(0).text().replace(/\n/g, '').replace(/\t/g, '').trim()
        const images = $('#Baca_Komik').find('img').map((i, el) => {
            return $(el).attr('src')
        }).get()
        let next_page;
        if ($('.pagination').find('a').attr('href')) {
            next_page = $('.pagination').find('a').attr('href').replace('/ch/', '').replace('/', '')
        }

        return res.json({
            title: title,
            images: images,
            next_page: next_page ? next_page : null,
        })
    } catch (error) {
        next(new sendError(error))
    }
})

const searchKomik = asyncHandler(async (req, res, next) => {
    let { search, page } = req.query
    page = page ? page : 1

    try {
        const response = await axiosService(`https://data.komiku.id/page/${page}/?post_type=manga&s=${search}`)
        const $ = cheerio.load(response)

        let dataArray = []
        const data = $('.bge').each((i, el) => {
            dataArray.push({
                title: $(el).find('div').attr('class', 'kan').find('a').find('h3').text().replace(/\n/g, '').trim(),
                url: $(el).find('div').attr('class', 'kan').find('a').attr('href').replace(url, '').replace('/manga/', '').replace('/', ''),
                thumbnail: $(el).find('div').attr('class', 'bgei').find('img').attr('data-src')
            })
        }).get()

        return res.status(200).json(new sendResponse(dataArray))
    } catch (error) {
        next(new sendError(error))
    }
})

const daftarPustaka = asyncHandler(async (req, res, next) => {
    try {
        const response = await axiosService(`${url}/daftar-komik/`)
        const $ = cheerio.load(response)

        let dataArray = []

        $('.ls4').each((i, el) => {
            dataArray.push({
                title: $(el).find('div').attr('class', 'ls4j').find('h4').find('a').text().replace(/\n/g, '').trim(),
                url: $(el).find('div').attr('class', 'ls4j').find('h4').find('a').attr('href').replace(url, '').replace('/manga/', '').replace('/', ''),
                thumbnail: $(el).find('div').attr('class', 'ls4v').find('img').attr('data-src')
            })
        }).get()

        await Promise.all(dataArray.map(async (data) => {
            const cek_komik = await findFirst('komiks', {
                slug: data.url
            })

            if (!cek_komik) {
                const komik = await create('komiks', {
                    user_id: 1,
                    title: data.title,
                    slug: data.url,
                    thumbnail: data.thumbnail,
                    created_at: new Date(),
                    updated_at: new Date()
                })

                console.log(`Komik ${title} berhasil di tambahkan`)
            }
        }))

        return res.status(200).json(new sendResponse(dataArray))
    } catch (error) {
        next(new sendError(error))
    }
})

module.exports = {
    getKomik,
    getChapter,
    searchKomik,
    getHome,
    daftarPustaka,
}