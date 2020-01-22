import ep from 'node-exiftool'
import path from 'path'
import fs from 'fs'

const exiftool = new ep.ExiftoolProcess()
const thumbsDir = 'thumb'
const imgsDir = 'img'
const importThumbsDir = 'img/thumb'
const DBfile = 'data.json'

exiftool
    .open()
    .then(() => exiftool.readMetadata(importThumbsDir, ['-File:all']))
    .then(metas => {
        const metasCleaned = metas.data
            .filter(meta => meta.RawFileName.match(/^thumb-([0-9]*).*/))
            .map(meta => formatMetas(meta))
        writeDB(JSON.stringify(metasCleaned))
    })
    .then(() => exiftool.close())
    .catch(console.error)

/*
Format brut metas

input: interesting metas
{
  RawFileName: 'thumb-3.jpg',
  ImageSize: '300x200',
  Title: lanzarote',
  Keywords: [
    'Cat: Nuit',
    'Cat: Juvénile',
    'De: Bart-Feuerborstenwurm',
    'Eng: Bearded Fireworm',
    'Es: Ver de fuego',
    'Fr: Ver de feu',
    'Lat: Hermodice carunculata',
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
    nameDe: 'Bart-Feuerborstenwurm',
    nameEn: 'Bearded Fireworm',
    nameEs: 'Ver de fuego',
    nameFr: 'Ver de feu',
    nameLat: 'Hermodice carunculata',
    location: 'lanzarote',
    category: ['Nuit', 'Juvénile']
}
*/
function formatMetas(meta) {
    const id = meta.RawFileName.match(/^thumb-([0-9]*).*/)[1]
    const keywords =
        meta.hasOwnProperty('Keywords') && Array.isArray(meta.Keywords)
            ? formatKeywords(meta.Keywords)
            : []
    const size = getSizes(meta.ImageSize)
    return {
        filepath: {
            thumb: path.join(thumbsDir, `thumb-${id}.jpg`),
            img: path.join(imgsDir, `img-${id}.jpg`)
        },
        thumbSize: { ...size.thumb },
        imgSize: { ...size.img },
        location: meta.Title,
        nameDe: keywords.De,
        nameEn: keywords.Eng,
        nameFr: keywords.Fr,
        nameEs: keywords.Es,
        nameLat: keywords.Lat,
        categories: keywords.Cat
    }

    function formatKeywords(keywords) {
        return keywords
            .filter(keyword => keyword.match(/\w*: \w/))
            .map(keyword => ({
                [keyword.split(':')[0]]: keyword.split(':')[1].trim()
            }))
            .reduce((obj, item) => {
                const key = Object.keys(item)[0]
                const value = Object.values(item)[0] || '?'
                if (obj.hasOwnProperty(key)) {
                    return Object.assign(obj, {
                        [key]: [value].concat(obj[key])
                    })
                } else {
                    return Object.assign(obj, { [key]: value })
                }
            }, {})
    }

    function getSizes(thumbSizeMeta) {
        const thumbSize = {
            width: +thumbSizeMeta.split('x')[0],
            height: +thumbSizeMeta.split('x')[1]
        }

        return {
            thumb: { ...thumbSize },
            img: { ...setImageSize(thumbSize) }
        }

        function setImageSize(thumbSize) {
            if (thumbSize.width > thumbSize.height) {
                return { width: 2400, height: 1600 }
            } else {
                return { width: 1060, height: 1600 }
            }
        }
    }
}

const writeDB = content =>
    fs.writeFile(DBfile, content, 'utf8', err => {
        if (err) throw err
    })
