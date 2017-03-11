'use strict'
import fs from 'fs'
import path from 'path'
import express from 'express'
import ws from 'ws'
import Rx from '@reactivex/rxjs'

const PICPATH = 'pic'
const PICEXT = ['.jpg', '.jpeg', '.png', '.gif']

let app = express()
app.use(express.static('pages'))
app.use(express.static('pic'))
let server = app.listen(8082, () => {
    console.log('app listening on port 8082')
})

let picListObservable = Rx.Observable
	.fromEvent(fs.watch(PICPATH), 'change')
	.startWith('startup change')
	.mergeMap( _ => Rx.Observable.bindNodeCallback(fs.readdir)(PICPATH)
		.mergeMap(files => files)
		.filter(file => PICEXT.includes(path.extname(file)))
		.toArray()
	)

let piclist = []
picListObservable.subscribe(files => piclist = files)
app.get('/piclist', (req, res) => {
	res.send(JSON.stringify(piclist))
})

new ws.Server({ server: server, perMessageDeflate: false })
.on('connection', (ws) => {
	picListObservable.subscribe(files => ws.send(JSON.stringify(files)))
})
