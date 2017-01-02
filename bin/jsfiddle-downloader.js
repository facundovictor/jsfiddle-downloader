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
var cheerio = require('cheerio');
var url_parser = require('url');
var fs = require("fs");

//#############################################################################

commander
    .version('0.0.1')
    .option('-u, --user <user>', 'Save all the users fiddles')
    .option('-l, --link <url>', 'Url of the fiddle to save')
    .option('-o, --output <path>', 'Target path to download the data')
    .option('-c, --compressed', 'Compress the spaces of the HTML output')
    .option('-i, --identifier <fiddle_id>', 'Identifier of the fiddle to save')
    .option('-v, --verbose', 'Verbose output')
    .parse(process.argv);

//#############################################################################
// Print helpers

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

function mkdirp (path) {
    Promise.bind(this)
        .then( function(){
            return Promise.promisify(fs.mkdir)(path);
        }).then( function(){
            logIfVerbose('Dir '+path+' created.');
        }).catch( function(error){
            // EEXIST: Dir already exists
            if ( error.code !== 'EEXIST' ) throw error;
        });
}

function writeFile(file_path, data) {
    Promise.bind(this)
        .then( function(){
            return Promise.promisify(fs.writeFile)(file_path, data);
        }).then( function(){
            logIfVerbose('File '+file_path+' created.');
        }).catch( function(error){
            // EEXIST: File already exists
            if ( error.code !== 'EEXIST' ) throw error;
        });
}

function isCommand(str){
    return /^show$|^embed$/.test(str);
}

function getCompletePath(fiddle_code, user){
    var complete_path = '/';
    if (user != null){
        complete_path += user +'/';
    }
    if (fiddle_code != null){
        complete_path += fiddle_code +'/show/light/';
    }
    return complete_path;
}

//#############################################################################
// HTTPS Requests

function getListOfFiddles(user){
    return new Promise(function (resolve, reject){
        var complete_path = "/api/user/"+user+
            "/demo/list.json?callback=Api&sort=framework&start=0&limit=50000";

        var options = {
            hostname: 'jsfiddle.net',
            port: 443,
            method: 'GET',
            path: complete_path
        };

        var request = https.request(options, function (res){
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                logIfVerbose('Retreive chunk');
                body += chunk;
            });
            res.on('end', function () {
                logIfVerbose('End request');
                if ((body.length > 3) && (body.substring(0,3) === 'Api')){
                    var jsonSource = body.substring(4,body.length - 3);
                    var data = JSON.parse(jsonSource);
                    if (data.status === 'ok'){
                        logIfVerbose('Parsed response..');
                        resolve(data.list);
                    } else {
                        logIfVerbose('JSFiddle API error..',true);
                        reject(data);
                    }
                } else {
                    logIfVerbose('JSFiddle API error..',true);
                    console.log('Please verify the user and try again!');
                    reject(new Error('JSFiddle API error..'));
                }
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

function makeHttpRequest(fiddle_code, user){
    return new Promise(function (resolve, reject){
        var complete_path = getCompletePath(fiddle_code, user);
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
            var body = '';
            res.setEncoding('utf8');
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

//#############################################################################

function insertDescription(html_raw, fiddle_data){
    return new Promise(function (resolve, reject){
        if (html_raw.length > 0){
            var config = {
                normalizeWhitespace: commander.compressed
            };
            $ = cheerio.load(html_raw, config);

            if (fiddle_data){
                $('head').append("<!-- Title: "+fiddle_data.title+" -->");
                $('head').append("<!-- Author: "+fiddle_data.author+" -->");
                $('head').append("<!-- Description: "+fiddle_data.description+" -->");
                $('head').append("<!-- Framework: "+fiddle_data.framework+" -->");
                $('head').append("<!-- Version: "+fiddle_data.veresion+" -->");
                $('head').append("<!-- Latest_version: "+fiddle_data.latest_version+" -->");
                $('head').append("<!-- Url: "+fiddle_data.url+" -->");
                $('head').append("<!-- Created date: "+fiddle_data.created+" -->");
            }
            resolve($.html());
        } else {
            reject(new Error('Empty html'));
        }
    });
}

function loadDataFromUrl(url){
    return new Promise(function (resolve, reject){
        if (typeof url === 'string' && (url.indexOf('/') > 0)){
            var data = {};
            var url_parts = url_parser.parse(url);
            var path_parts = url_parts.path.split('/');

            if (path_parts.length > 1){
                amount_of_parts = path_parts.length - 1; // Minus the first slash

                if (amount_of_parts === 1){
                    // Only one argument (fiddle_id)
                    data.fiddle_code = path_parts[1];
                    logIfVerbose(    'Detected single fiddle url..')
                } else {
                    // Could bee user/fiddle_id or fiddle_id/command
                    if (isCommand(path_parts[2])){
                        data.fiddle_code = path_parts[1];
                        logIfVerbose(    'Detected fiddle and command url..')
                    } else {
                        // The user may not be present on the url
                        if (amount_of_parts === 2) {
                            data.fiddle_code = path_parts[1];
                            logIfVerbose(    'Detected fiddle url..')
                        } else {
                            data.user = path_parts[1];
                            data.fiddle_code = path_parts[2];
                            logIfVerbose(    'Detected user and fiddle url..')
                        }
                    }
                }
                process.stdout.write('Detected fiddle code = '+chalk.green(data.fiddle_code));
                if (data.user != null){
                    process.stdout.write(', from user = '+chalk.green(data.user));
                }
                process.stdout.write('\n');
                resolve(data);
            }else{
                reject(new Error('Invalid url'));
            }
        }else{
            reject(new Error('Invalid url'));
        }
    });
}

function recoverSingleFiddle(url, output, fiddle_data){
    Promise.bind(this)
        .then(function(){
            return loadDataFromUrl(url);
        }).then( function(data){
            output = output || global.cwd+'/'+data.fiddle_code+'.html'
            return makeHttpRequest(data.fiddle_code, data.user);
        }).then( function(fiddle) {
            return insertDescription(fiddle, fiddle_data);
        }).then( function(fiddle) {
            console.log('Output file = '+output);
            writeFile(output, fiddle);
        }).catch( function (error) {
            printError(error);
            process.exit(1);
        });
}

function getValidCode(code){
    return new Promise(function (resolve, reject){
        if (/^[a-zA-Z0-9_]*$/.test(code)){
            resolve(code);
        } else {
            reject(code);
        }
    });
}

function recoverSingleFiddleById(fiddle_code, output){
    Promise.bind(this)
        .then(function(){
            return getValidCode(fiddle_code);
        }).then( function(code){
            return makeHttpRequest(code);
        }).then( function(fiddle) {
            output = output || global.cwd+'/'+fiddle_code+'.html'
            console.log('Output file = '+output);
            writeFile(output, fiddle);
        }).catch( function (error) {
            printError(error);
            process.exit(1);
        });
}

function saveFiddles(list, output){
    global.cwd = process.cwd();
    var amount = list.length;
    var promises = [];
    for (var i=0; i < amount; i++) {
        var fiddle = list[i];
        var url = fiddle.url.substring(2, fiddle.url.length);
        logIfVerbose('Processing fiddle = '+url);
        promises.push(recoverSingleFiddle(url, null, fiddle));
    }
    return Promise.all(promises);
}

function recoverAllFiddles(user, output){
    var current_dir = process.cwd();
    Promise.bind(this)
        .then(function(){
            mkdirp(output);
        }).then(function(){
            return getListOfFiddles(user);
        }).then(function(list){
            process.chdir(output);
            return saveFiddles(list, output);
        }).then(function(result){
            console.log(chalk.green('Download terminated'));
        }).catch( function (error) {
            printError(error);
            process.exit(1);
        });
}

//#############################################################################

(function main (){
    global.cwd = process.cwd();
    if (commander.user){
        recoverAllFiddles(commander.user, commander.output || 'output_dir');
    } else if (commander.link){
        recoverSingleFiddle(commander.link, commander.output);
    } else if (commander.identifier){
        recoverSingleFiddleById(commander.identifier, commander.output);
    } else {
        commander.help();
    }
})();
