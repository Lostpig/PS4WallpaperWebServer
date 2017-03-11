'use strict'
import fs from 'fs'
import path from 'path'
import EventEmitter from 'events'
import express from 'express'
import WebSocket from 'ws'
import Rx from '@reactivex/rxjs'

const PICPATH = 'pic'
const PICEXT = ['.jpg', '.jpeg', '.png', '.gif']

let app = express()
app.use(express.static('pages'))
app.use(express.static('pic'))
let server = app.listen(8082, () => { 
    console.log('app listening on port 8082')
})

let fileChangeObservable = Rx.Observable.fromEvent(fs.watch(PICPATH), 'change')
	.startWith('startup change')
	.audit(ev => Rx.Observable.interval(ev === 'startup change' ? 0 : 1000))
	.mergeMap(_ => {
		console.log(`[${Date.now()}]:scan files`)
		return Rx.Observable.bindNodeCallback(fs.readdir)(PICPATH)
		.mergeMap(files => files)
		.filter(file => PICEXT.includes(path.extname(file)))
		.toArray()
	})
	

class FilesList extends EventEmitter {
	constructor() {
		super()
		this.files = []
	}
	set (files) {
		this.files = files
		this.emit('change', this)
	}
	get () {
		return this.files
	}
	getJson () {
		return JSON.stringify(this.files)
	}
}
let fileslist = new FilesList()
	
fileChangeObservable.subscribe(files => fileslist.set(files))
app.get('/piclist', (req, res) => {
	console.log(`[${Date.now()}]:get piclist`)
	res.send(fileslist.get())
})

new WebSocket.Server({ server: server, perMessageDeflate: false })
.on('connection', (ws) => {
	console.log(`[${Date.now()}]:websocket open`)
	
	let wsSubscriber = Rx.Observable
		.fromEvent(fileslist, 'change')
		.startWith(fileslist)
		.subscribe(files => {
			if (ws.readyState === WebSocket.OPEN) {
				console.log(`[${Date.now()}]:websocket send`)
				ws.send(files.getJson());
			}
		})
	
	ws.on('close', () => {
		console.log(`[${Date.now()}]:websocket close`)
		wsSubscriber.unsubscribe()
	})
})