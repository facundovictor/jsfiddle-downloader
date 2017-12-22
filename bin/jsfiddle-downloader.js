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
    .version('0.1.7')
    .option('-u, --user <user>', 'Save all the users fiddles')
    .option('-l, --link <url>', 'Url of the fiddle to save')
    .option('-o, --output <path>', 'Target path to download the data')
    .option('-c, --compressed', 'Compress the spaces of the HTML output')
    .option('-i, --identifier <fiddle_id>', 'Identifier of the fiddle to save')
    .option('-f, --force-http', 'Use http when the URI method is undefined')
    .option('-v, --verbose', 'Verbose output')
    .option('-I, --filename-identifier', 'Use fiddle identifier as filename (default)')
    .option('-T, --filename-title', 'Use fiddle title as filename')
    .option('-IT, --filename-identifier-title', 'Use fiddle identifier and title as filename')
    .option('-S, --filename-spaces', 'Keep spaces in filename (default: replace by underscores)')
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

function updateFilename(output, fiddle_code, html_raw) {
    if (output) {
        return output; // filename specified by user
    } else {
        output = fiddle_code; // default
        if (commander.filenameTitle) {
            var $ = cheerio.load(html_raw);
            var fiddle_title = $('head > title').text();
            if (commander.filenameSpaces == undefined) {
                fiddle_title = fiddle_title.replace(/\s+/g, '_');
            }
            if (commander.filenameIdentifier) {
                output += '_'+fiddle_title;
            } else {
                output = fiddle_title;
            }
        }
        return global.cwd+'/'+output+'.html'
    }
}

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

function getCompletePath(fiddle_code, fiddle_version, user){
    var complete_path = '/';
    if (user != null){
        complete_path += user +'/';
    }
    if (fiddle_code != null){
        complete_path += fiddle_code + '/';
    }
    if (fiddle_version != null){
        complete_path += fiddle_version + '/';
    }
    complete_path += 'show/light/';
    return complete_path;
}

function forceUseHttpOnUndefinedURIMethod(html_raw) {
    return new Promise(function (resolve) {
        var $ = cheerio.load(html_raw);
        // If the URI must be forced to use http
        if (commander.forceHttp) {

            // Fore each link that has not method set, use http.
            $('link').each(function (index, elem) {
                var href = $(elem).attr('href');
                if (href && (href.substr(0,2) === '//')) {
                    $(elem).attr('href', 'http:' + $(elem).attr('href'))
                }
            });

            // Fore each script that has not method set, use http.
            $('script').each(function (index, elem) {
                var src = $(elem).attr('src');
                if (src && (src.substr(0,2) === '//')) {
                    $(elem).attr('src', 'http:' + $(elem).attr('src'))
                }
            });
        }
        resolve($.html());
    });
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
                logIfVerbose('Retrieve chunk');
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

function makeHttpRequest(fiddle_code, fiddle_version, user){
    return new Promise(function (resolve, reject){
        var complete_path = getCompletePath(fiddle_code, fiddle_version, user);
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
                logIfVerbose('Retrieve chunk');
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
            var $ = cheerio.load(html_raw, config);

            if (fiddle_data){
                $('head').append("<!-- Title: "+fiddle_data.title+" -->");
                $('head').append("<!-- Author: "+fiddle_data.author+" -->");
                $('head').append("<!-- Description: "+fiddle_data.description+" -->");
                $('head').append("<!-- Framework: "+fiddle_data.framework+" -->");
                $('head').append("<!-- Version: "+fiddle_data.version+" -->");
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

            // Remove the first slash
            path_parts.shift();

            // If the url finishes with a slash, it must be ignored
            if (path_parts[path_parts.length - 1] === '')
                path_parts.length--;

            var amount_of_parts = path_parts.length;

            if (amount_of_parts > 0){

                // The url could end with a command (/show, /embed)
                if (isCommand(path_parts[amount_of_parts - 1])){
                    logIfVerbose('Detected url finished in a command..');
                    amount_of_parts--;
                }

                switch (amount_of_parts){

                    case 1 :  // The user may not be present on the url
                        data.fiddle_code = path_parts[0];
                        logIfVerbose('Detected fiddle url..');
                        break;
                    case 2 :
                        // The second value could be the fiddle version
                        if (/^\d+$/.test(path_parts[1])) {
                            data.fiddle_code = path_parts[0];
                            data.fiddle_version = path_parts[1];
                            logIfVerbose('Detected fiddle url and version..')
                        } else {
                            // The user and the fiddle url is present
                            data.user = path_parts[0];
                            data.fiddle_code = path_parts[1];
                            logIfVerbose('Detected user and fiddle code..')
                        }
                        break;
                    case 3  :
                        // The user and the fiddle code is present
                        data.user = path_parts[0];
                        data.fiddle_code = path_parts[1];
                        // The third value could be the fiddle version
                        if (/^\d+$/.test(path_parts[2])) {
                            data.fiddle_version = path_parts[2];
                            logIfVerbose('Detected user, fiddle and version..')
                        } else {
                            logIfVerbose('Detected fiddle url and version..')
                        }
                        break;
                    default :
                        logIfVerbose('Unrecognized url..')
                        reject(new Error('Invalid url'));
                }

                process.stdout.write('Detected fiddle code = '+chalk.green(data.fiddle_code));

                if (data.fiddle_version != null)
                    process.stdout.write(', version = '+chalk.green(data.fiddle_version));

                if (data.user != null)
                    process.stdout.write(', from user = '+chalk.green(data.user));

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
    var fiddle_code;
    Promise.bind(this)
        .then(function(){
            return loadDataFromUrl(url);
        }).then( function(data){
            fiddle_code = data.fiddle_code;
            return makeHttpRequest(data.fiddle_code, data.fiddle_version, data.user);
        }).then( function(fiddle) {
            return forceUseHttpOnUndefinedURIMethod(fiddle);
        }).then( function(fiddle) {
            return insertDescription(fiddle, fiddle_data);
        }).then( function(fiddle) {
            output = updateFilename(output, fiddle_code, fiddle);
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
            return forceUseHttpOnUndefinedURIMethod(fiddle);
        }).then( function(fiddle) {
            output = updateFilename(output, fiddle_code, fiddle);
            console.log('Output file = '+output);
            writeFile(output, fiddle);
        }).catch( function (error) {
            printError(error);
            process.exit(1);
        });
}

function saveFiddles(list){
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

function recoverAllFiddles(user, output_dir){
    var current_dir = process.cwd();
    Promise.bind(this)
        .then(function(){
            mkdirp(output_dir);
        }).then(function(){
            return getListOfFiddles(user);
        }).then(function(list){
            process.chdir(output_dir);
            return saveFiddles(list);
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
