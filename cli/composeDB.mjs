import ep from 'node-exiftool'
import path from 'path'

const exiftool = new ep.ExiftoolProcess()
const thumbsDir = 'thumb'
const imgsDir = 'img'
const importThumbsDir = 'img/thumb'

exiftool.open()
    .then(() => exiftool.readMetadata(importThumbsDir, ['-File:all']))
    .then((metas) => {
        const metasCleaned = metas.data.map(meta => formatMetas(meta))
        console.log(metasCleaned)
        console.log('metas.error:', metas.error)        
    })
    .then(() => exiftool.close())
    .catch(console.error)

/*
Format brut metas

input: interesting metas
{
  RawFileName: 'thumb-3.jpg',
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
    thumb: 'thumb/thumb-3.jpg'
    img: 'thumb/img-3.jpg'
    nameDe: Bart-Feuerborstenwurm',
    nameEn: Bearded Fireworm',
    nameFr: Ver de feu',
    nameLat: Hermodice carunculata',
    location: lanzarote'
}
*/
function formatMetas(metas) {
    const id = metas.RawFileName.match(/^thumb-([0-9]*).*/)[1]
    const keywords = formatKeywords(metas.Keywords)

    return {
        'thumb': path.join(thumbsDir, `thumb-${id}.jpg`),
        'img': path.join(imgsDir, `thumb-${id}.jpg`),
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
}
