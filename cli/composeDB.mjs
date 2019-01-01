import ep from 'node-exiftool'
import path from 'path'
import fs from 'fs'


const exiftool = new ep.ExiftoolProcess()
const thumbsDir = 'thumb'
const imgsDir = 'img'
const importThumbsDir = 'img/thumb'
const DBfile = 'data.json'

exiftool.open()
    .then(() => exiftool.readMetadata(importThumbsDir, ['-File:all']))
    .then((metas) => {
        const metasCleaned = metas.data.map(meta => formatMetas(meta))
        writeDB(JSON.stringify(metasCleaned))
        console.log('metas.error:', metas.error)        
    })
    .then(() => exiftool.close())
    .catch(console.error)

/*
Format brut metas

input: interesting metas
{
  RawFileName: 'thumb-3.jpg',
  ImageSize: '300x200',
  Keywords: [
    'De: Bart-Feuerborstenwurm',
    'Eng: Bearded Fireworm',
    'Fr: Ver de feu',
    'Lat: Hermodice carunculata',
    'Loc: lanzarote'
  ]
}
output:
{
    filepath: {
        thumb: 'thumb/thumb-3.jpg',
        img: 'thumb/img-3.jpg'
    }
    thumbSize: { width: '2400', height: '1600' },
    imageSize: { width: '300', height: '200' },
    nameDe: Bart-Feuerborstenwurm',
    nameEn: Bearded Fireworm',
    nameFr: Ver de feu',
    nameLat: Hermodice carunculata',
    location: lanzarote'
}
*/
function formatMetas(meta) {
    const id = meta.RawFileName.match(/^thumb-([0-9]*).*/)[1]
    const keywords = formatKeywords(meta.Keywords)
    const size = getSizes(meta.ImageSize)
    return {
        'filepath': {
            'thumb': path.join(thumbsDir, `thumb-${id}.jpg`),
            'img': path.join(imgsDir, `img-${id}.jpg`)
        },
        'thumbSize': {...size.thumb},
        'imgSize': {...size.img},
        'nameDe': keywords.De,
        'nameEn': keywords.Eng,
        'nameFr': keywords.Fr,
        'nameLat': keywords.Lat,
        'location': keywords.Loc
    }

    function formatKeywords(keywords) {
        return keywords
            .filter(keyword => keyword.match(/\w*: \w/))
            .map(keyword => ({
                [keyword.split(':')[0]]:  keyword.split(':')[1].trim()
            }))
            .reduce((obj, item) => {
                const key = Object.keys(item)[0]
                const value = Object.values(item)[0] || '?'

                return Object.assign(obj, {[key]: value})
            }, {})
    }

    function getSizes(imageSize) {
        const thumbSize = {'width': +imageSize.split('x')[0], 'height': +imageSize.split('x')[1]}

        return {
            'img': {...thumbSize},
            'thumb': {...setImageSize(thumbSize)}
        }

        function  setImageSize(thumbSize) {
            if (thumbSize.width > thumbSize.height) {
              return {'width': 2400, 'height': 1600}
            } else {
              return {'width': 1060, 'height': 1600}
            }
        }
    }
}

const writeDB = content =>
    fs.writeFile(DBfile, content, 'utf8', err => {
        if (err) throw err
    })
