import ep from 'node-exiftool'

const exiftool = new ep.ExiftoolProcess()
const thumbsDir = 'img/thumb'

exiftool.open()
    .then(() => exiftool.readMetadata(thumbsDir, ['-File:all']))
    .then((metas) => {
        console.log(metas)
    })
    .then(() => exiftool.close())
    .catch(console.error)