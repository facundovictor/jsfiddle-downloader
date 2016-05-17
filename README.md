[![npm version](https://badge.fury.io/js/jsfiddle-downloader.svg)](https://badge.fury.io/js/jsfiddle-downloader)
# jsfiddle-downloader

Download fiddles from jsFiddle.net, just using a NodeJS script and save it as a single HTML file.

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
	-i, --identifier <fiddle_id>  Identifier of the fiddle to save
	-v, --verbose                 Verbose output

```

To download a single fiddle from its id:

```
  jsfiddle-downloader -i <fiddle-id> [-o <output file>]
```

To download a single fiddle from its url:

```
  jsfiddle-downloader -l <url> [-o <output file>]
  jsfiddle-downloader -l jsfiddle.net/<user>/<fiddle-id>
  jsfiddle-downloader -l https://jsfiddle.net/<fiddle-id>
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


