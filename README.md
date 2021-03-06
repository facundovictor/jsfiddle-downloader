# jsfiddle-downloader
[![Build Status](https://travis-ci.org/facundovictor/jsfiddle-downloader.svg?branch=master)](https://travis-ci.org/facundovictor/jsfiddle-downloader) [![npm version](https://badge.fury.io/js/jsfiddle-downloader.svg)](https://badge.fury.io/js/jsfiddle-downloader) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/facundovictor/jsfiddle-downloader/master/LICENSE) [![Total Downloads](https://img.shields.io/npm/dt/jsfiddle-downloader.svg)](https://npm-stat.com/charts.html?package=jsfiddle-downloader)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ffacundovictor%2Fjsfiddle-downloader.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Ffacundovictor%2Fjsfiddle-downloader?ref=badge_shield)

Download fiddles from jsFiddle.net, just using a NodeJS script and save it as a single HTML file.

![NPM](https://nodei.co/npm/jsfiddle-downloader.png?compact=true)

**Installation**:

```
    npm install jsfiddle-downloader -g
```

**How to use it**:

```
  Usage: jsfiddle-downloader [options]

  Options:

        -h, --help                        output usage information
        -V, --version                     output the version number
        -u, --user <user>                 Save all the users fiddles
        -l, --link <url>                  Url of the fiddle to save
        -o, --output <path>               Target path to download the data
        -c, --compressed                  Compress the spaces of the HTML output
        -i, --identifier <fiddle_id>      Identifier of the fiddle to save
        -f, --force-http                  Use http when the URI method is undefined
        -v, --verbose                     Verbose output
        -I, --filename-identifier         Use fiddle identifier as filename (default)
        -T, --filename-title              Use fiddle title as filename
        -IT, --filename-identifier-title  Use fiddle identifier and title as filename
        -S, --filename-spaces             Keep spaces in filename (default: replace by underscores)
```

To download a single fiddle from its id:

```
  jsfiddle-downloader -i <fiddle-id> [-o <output file>] [-f]
```

To download a single fiddle from its url:

```
  jsfiddle-downloader -l <url> [-o <output file>]
  jsfiddle-downloader -l jsfiddle.net/<user>/<fiddle-id>
  jsfiddle-downloader -l jsfiddle.net/<user>/<fiddle-id>/<version>
  jsfiddle-downloader -l https://jsfiddle.net/<fiddle-id>
  jsfiddle-downloader -l https://jsfiddle.net/<fiddle-id>/<version>
  jsfiddle-downloader -l https://jsfiddle.net/<user>/<fiddle-id>/show/ -o myfiddle.html
```

To download all scripts of a determinated 'user' from jsFiddle.net:

```
  jsfiddle-downloader -u <user> [-o <output file>]
```

It'll download all backups in the currrent directory, the jsFiddles scripts will be named by default as:

```
  [<output-folder>/]<id-fiddle>.html
```

To save the files using the fiddle's title, provide the parameter `-T`:

```
  jsfiddle-downloader -T -u <user> [-o <output file>]
```

It'll download all backups in the currrent directory, the jsFiddles scripts will be named as:

```
  [<output-folder>/]<title-fiddle>.html
```

To avoid running a local server for resolving URIs that doesn't have an URI method defined. Use the `-f` parameter:

```
  jsfiddle-downloader -f -i <fiddle-id>
  jsfiddle-downloader -f -l <url>
  jsfiddle-downloader -f -u <user>
```

This will replace all the `http://` in the href of link tags and in the src of script tags.

You can make the filenames more informative with these options:

`-T` : `<fiddle-title>.html` (title given to the fiddle to make it public)

`-IT`: `<fiddle-id>_<fiddle-title>.html` (combined identifier and title)

`-S` : Keep spaces in filename (default: replace by underscores)

**Tests:**

In the project directory `jsfiddle-downloader` run

`mocha test [--keep]`

If you run tests with option `--keep`, the temporary directories containing
html files downloaded during tests will be preserved for inspection.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ffacundovictor%2Fjsfiddle-downloader.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Ffacundovictor%2Fjsfiddle-downloader?ref=badge_large)