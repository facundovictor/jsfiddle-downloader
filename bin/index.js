#!/usr/bin/env node
//#############################################################################
// @author: Facundo Victor
// @licence: MIT
// @description: Script that allows to do a backup of your jsFiddles to disk.
//#############################################################################

var commander = require('commander');
var chalk = require('chalk');
var https = require('https');
var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(fs);

//#############################################################################

commander
	.version('0.0.1')
	.option('-u, --user <user>', 'Save all the users fiddles')
	.option('-l, --link <url>', 'Url of the fiddle to save')
	.option('-o, --output <path>', 'Target path to download the data')
	.option('-v, --verbose', 'Verbose output')
	.parse(process.argv);

//#############################################################################

function logIfVerbose(str, error){
	if (commander.verbose){
		if (error){
			console.error(str);
		}else{
			console.log(chalk.bgGreen(str));
		}
	}
}

function printError(str){
	console.error(chalk.red(str));
}

//#############################################################################

function makeHttpRequest(user, fiddle_code){
	return new Promise(function (resolve, reject){
		var complete_path = '/'+user+'/'+fiddle_code+'/show/light/';
		var options = {
			hostname: 'jsfiddle.net',
			port: 443,
			method: 'GET',
			path: complete_path,
			headers: {
				'Referer': 'https://jsfiddle.net' + complete_path
			}
		};

		var request = https.request(options, function (res){
			res.setEncoding('utf8');
			body = '';
			res.on('data', function (chunk) {
				logIfVerbose('Retreive chunk');
				body += chunk;
			});
			res.on('end', function () {
				logIfVerbose('End request');
				resolve(body);
			});
		});

		request.on('error', function(error){
			logIfVerbose(error, true);
			reject(error);
		});
		request.write('');
		request.end();
	});
}


function loadDataFromUrl(url){
	return new Promise(function (resolve, reject){
		if (typeof url == 'string' && (url.indexOf('/') > 0)){
			var data = {};
			url_parts = url.split('/');
			if (url_parts.length >= 5 && url_parts[0] == 'https:'){
				data.user = url_parts[3];
				data.fiddle_code = url_parts[4];
				logIfVerbose(	'Detected long url..')
			} else if (url_parts.length >= 3){
				data.user = url_parts[1];
				data.fiddle_code = url_parts[2];
				logIfVerbose(	'Detected short url..')
			} else {
				printError('Invalid url... ');
				reject(new Error('Invalid url'));
			}
			console.log('user = '+chalk.green(data.user)+', code = '+chalk.green(data.fiddle_code));
			resolve(data);
		}else{
			reject(new Error('Invalid url'));
		}
	});
}

function recoverSingleFiddle(url, output){
	Promise
		.bind(this)
		.then(function(){
			return loadDataFromUrl(url);
		}).then( function(data){
			return makeHttpRequest(data.user, data.fiddle_code)
		}).then( function(fiddle) {
			fs.writeFile(output, body)
		}).catch( function (error) {
			printError(error);
			process.exit(1);
		});
}

//#############################################################################

(function main (){
  if (commander.user){
		// recoverAllFiddles(commander.user);
	} else if (commander.link) {
		recoverSingleFiddle(commander.link, commander.output || 'output.html');
	} else {
		commander.help();
	}
})();
