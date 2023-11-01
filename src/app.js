const express = require('express')
const hbs = require('hbs')
const path = require('path')
const geocode = require('./utils/geocode')
const forecast = require('./utils/prediksiCuaca')
const axios = require('axios')

const app = express()
const port = process.env.PORT || 3000
//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

//handlebars engine and view location
app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)

//setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    res.render('index',{
        title: 'Aplikasi Cek Cuaca',
        name: 'Ghenta Alif Alde'
    })
})

app.get('/tentang', (req, res) => {
    res.render('tentang', {
        title: 'Tentang Saya',
        name: 'Ghenta Alif Alde'
    })
})

app.get('/bantuan', (req, res) => {
    res.render('bantuan', {
        title: 'Bantuan',
        teksBantuan: 'Bantuan apa yang anda butuhkan?',
        name: 'Ghenta Alif Alde'
    })
})
app.get('/berita', async (req, res) => {
    try {
        const urlApiMediaStack = 'http://api.mediastack.com/v1/news';
        const apiKey = 'fa9dc3e7242dca9a7c85e18a7e33e5ce';

        const params = {
            access_key: apiKey,
            countries: 'id', 
        };

        const response = await axios.get(urlApiMediaStack, { params });
        const dataBerita = response.data;

        res.render('berita', {
            nama: 'Ghenta Alif Alde',
            judul: 'Berita',
            berita: dataBerita.data,
            gambar: dataBerita.data.images
        });
    } catch (error) {
        console.error(error);
        res.render('error', {
            judul: 'Terjadi Kesalahan',
            pesanKesalahan: 'Terjadi kesalahan saat mengambil berita.',
    });
}
});

app.get('/infocuaca', (req, res) => {
    if(!req.query.address){
        return res.send({
            error:'Kamu harus memasukan lokasi yang ingin dicari'
        })
    }
    geocode(req.query.address, (error, { latitude, longitude, location } = {}) => {
        if (error){
            return res.send({error})
        }
        forecast(latitude, longitude, (error, dataPrediksi) => {
            if (error){
                return res.send({error})
            }
            res.send({
                prediksiCuaca: dataPrediksi,
                lokasi: location,
                address: req.query.address
            })
        })
    })
})



app.get('/bantuan/*', (req, res) => {
    res.render('404',{
        title: '404',
        name: 'Ghenta Alif Alde',
        pesanError: 'Belum ada artikel bantuan tersedia'
    })
})

app.get('*', (req, res) => {
    res.render('404',{
        title: '404',
        name: 'Ghenta Alif Alde',
        pesanError: 'Halaman tidak ditemukan'
    })
})

app.listen(port, () => {
    console.log('Server is running on port '+ port)
})