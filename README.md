# jsfiddle-downloader
[![npm version](https://badge.fury.io/js/jsfiddle-downloader.svg)](https://badge.fury.io/js/jsfiddle-downloader) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/facundovictor/jsfiddle-downloader/master/LICENSE) [![Total Downloads](https://img.shields.io/npm/dt/jsfiddle-downloader.svg)](https://npm-stat.com/charts.html?package=jsfiddle-downloader)

Download fiddles from jsFiddle.net, just using a NodeJS script and save it as a single HTML file.

![NPM](https://nodei.co/npm/jsfiddle-downloader.png?compact=true)

**Installation**:

```
    npm install jsfiddle-downloader -g
```

**How to use it**:

```
    Usage: node jsfiddle-downloader [options]

    Options:

    -h, --help                    output usage information
    -V, --version                 output the version number
    -u, --user <user>             Save all the users fiddles
    -l, --link <url>              Url of the fiddle to save
    -o, --output <path>           Target path to download the data
    -c, --compressed              Compress the spaces of the HTML output
    -i, --identifier <fiddle_id>  Identifier of the fiddle to
    -f, --force-http              Use http when the URI method is undefined
    -v, --verbose                 Verbose output
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

It'll download all backups in the currrent directory, the jsFiddles scripts will be named as:

```
  [<output-folder>/]<id-fiddle>.html
```

To avoid running a local server for resolving URIs that doesn't have an URI method defined. Use the `-f` parameter:

```
  jsfiddle-downloader -f -i <fiddle-id>
  jsfiddle-downloader -f -l <url>
  jsfiddle-downloader -f -u <user>
```

This will replace all the `http://` in the href of link tags and in the src of script tags.
