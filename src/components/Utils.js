export class XHR {
	static parseJSON(response) {
		return response.json()
	}

	static fetch(url, options) {
		return window
			.fetch(url, options)
			.then(XHR.checkStatus)
			.then(XHR.parseJSON)
	}

	static checkStatus(response) {
		if (response.ok) return response

		const error = new Error(`HTTP Error ${response.statusText}`)
		error.status = response.statusText
		error.response = response
		console.log(error)
		throw error
	}
}

export class Storage {
	static STORAGE = 'local'

	static set = (key, value) =>
		new Promise((resolve, reject) => {
			chrome.storage[Storage.STORAGE].set({ [key]: value }, data => Storage.check(data, resolve, reject))
		})

	static get = (key, defaultValue) =>
		new Promise((resolve, reject) => {
			chrome.storage[Storage.STORAGE].get({ [key]: defaultValue }, data => Storage.check(data[key], resolve, reject))
		})

	static remove = key =>
		new Promise((resolve, reject) => {
			chrome.storage[Storage.STORAGE].remove(key, data => Storage.check(data, resolve, reject))
		})

	static check(data, resolve, reject) {
		if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError)
			return reject(chrome.runtime.lastError)
		}

		return resolve(data)
	}
}

export class Chrome {
	static send(action, additional = {}) {
		const search = document.location.search.replace('?', '').split('='),
			index = search.indexOf('tabid')
		if (index !== -1) {
			console.log('sending req', action, additional)
			chrome.tabs.sendMessage(+search[index + 1], { action, ...additional }, null, function() {})
			return true
		}
		return false
	}

	static i18n(key) {
		return chrome.i18n.getMessage(key) || `i18n::${key}`
	}
}

export const i18n = Chrome.i18n

//const regex = /-fr[atx]\d-\d/
export function updateCDN(url) {
	return url
	// return url.replace(regex, '-frt3-1') // 10.08.2017
}

export function shallowDiffers(a, b) {
	for (const key in a) if (a[key] !== b[key]) return true
	for (const key in b) if (!(key in a)) return true
	return false
}

export const webWorkerScript = `const postMsg = (url, blob) => self.postMessage(url)
function checkStatus(response) {
	if (response.ok) return response
	throw response
}
const opts = {headers: {accept: 'image/webp,image/apng,image/*,*/*;q=0.8'}, redirect: 'follow', referrerPolicy: 'no-referrer'}
self.addEventListener('message', event => {
	const url = event.data,
		bound = postMsg.bind(undefined, url)
	self.fetch(url, opts).then(checkStatus).then(bound).catch(e => console.error(e) && bound())
})
`

export function documentReady() {
	return new Promise((resolve, reject) => {
		if (document.readyState === 'complete') resolve()
		else document.addEventListener('DOMContentLoaded', resolve)
	})
}

let workerBlob = null
export async function getWorkerBlob() {
	await documentReady() // creating a blob is synchronous and takes around 120ms on a powerful machine
	if (workerBlob === null) workerBlob = URL.createObjectURL(new Blob([webWorkerScript], { type: 'application/javascript' }))
	return workerBlob
}

// based on https://code.lengstorf.com/get-form-values-as-json/
const reducerFunction = (data, element) => {
	const type = element.type
	if (type === undefined) data.push(element.value)
	else if (type === 'checkbox')
		// option
		data[element.name] = element.checked
	else if (type.indexOf('select') !== -1) data[element.name] = [].reduce.call(element.options, reducerFunction, [])
	else if (type === 'button' || element.name.indexOf('_add') !== -1 || type === 'submit') undefined
	else if (type === 'number') data[element.name] = +element.value
	else data[element.name] = element.value // number, text, etc

	return data
}
export const formToJSON = elements => [].reduce.call(elements, reducerFunction, {})
