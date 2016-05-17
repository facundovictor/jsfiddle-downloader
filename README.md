# jsfiddle-downloader

Download fiddles from jsFiddle.net, just using a NodeJS script and save it as a single HTML file.
Evolved from "Joe Kuan" script --> https://joekuan.wordpress.com/2012/10/10/using-phantomjs-to-download-jsfiddle-net-code/

**Installation**:

```
	npm install jsfiddle-downloader -g
```

**How to use it**:

```
	Usage: node jsfiddle-downloader [options]

	Options:

	-h, --help           output usage information
	-V, --version        output the version number
	-u, --user <user>    Save all the users fiddles
	-l, --link <url>     Url of the fiddle to save
	-o, --output <path>  Target path to download the data
	-c, --compressed     Compress the spaces of the HTML output
	-v, --verbose        Verbose output
```

To download a single fiddle from its url:

```
  jsfiddle-downloader -l <url> [-o <output file>]
```

To download all scripts of a determinated 'user' from jsFiddle.net:

```
  jsfiddle-downloader -l <url> [-o <output file>]
```

It'll download all backups in the currrent directory, the jsFiddles scripts will be named as:

```
  [<output-folder>/]<id-fiddle>.html
```


