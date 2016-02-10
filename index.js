'use strict'
let path = require('path');
let fs = require('fs-extra-promise');
let Promise = require('bluebird');

module.exports = function (mikser, context) {
	let tocInfo = {
		collection: context.data[context.layout.meta.toc] || context.data['toc'],
		destinationFolder: path.join(mikser.options.runtimeFolder, 'toc'),
		getDestination: function() {
			let ext = path.extname(context.document.destination)
			return context.document.destination.replace(mikser.config.outputFolder, this.destinationFolder).replace(ext, '.txt');
		},
		content: []
	}

	if(!Array.isArray(tocInfo.collection)) {
		let err = new Error('Collection is required');
		err.origin = 'toc';
		throw err;
	}

	context.process(() => {
		return Promise.each(tocInfo.collection, (document) => {
			return fs.readFileAsync(document.source).then((content) => {
				tocInfo.content.push(new Buffer('[' + document._id + ']' + '\n' + content + '\n\n'));
			}).then(() => {
				return fs.outputFileAsync(tocInfo.getDestination(), Buffer.concat(tocInfo.content));
			});
		});
	});
}