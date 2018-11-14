# Cypher.js
Cypher.js is a graph database query engine & graph database implemented from scratch in Javascript with zero dependencies. It implements the Cypher graph db query language.

For inquiries, reach out to Cypher.js author Niclas Kjäll-Ohlsson (niclas@fusebase.io).

Demos
1. Just for fun: https://bit.ly/2Dbylrh
2. Game of Thrones: https://bit.ly/2QoBSG9
3. Time series analysis: https://bit.ly/2SX7K6v
4. Generate random strings: https://bit.ly/2FoJcAW
5. Bill of material explosion: https://bit.ly/2DoKJE6

Note: Does not work in Internet Explorer

## Usage

**Client-side (web browser)**

1. Include
	
	```<script type="text/javascript" src="Cypher.min.js"></script>```

2. Use
	
	```
	var options = {

		// Default will run as Web Worker, i.e. runInWebWorker = true if not specified
		// Set runInWebWorker to false to run in same thread as main page javascript
		runInWebWorker: true,

		// Proxy for xmlhttprequest to avoid CORS. This is optional. If not provided
		// will attempt to download from given URL directly which might give error
		// Access denied for URL resource due to "Cross-Origin Request Blocked"
		// The data download proxy must take one GET parameter, u, which is the URL to download
		// and must return the data from the URL to download. 
		// Also it should add the "Access-Control-Allow-Origin: *" http header to the response
		// if the proxy is not served from same url as Cypher.js script is run from
		dataDownloadProxy: "http://proxy_url?u="

	};
	var cypher = new Cypher(options);
	
	var query = 'merge (n:Test{what:"Hello World"}) return n';
	
	cypher.execute(
		query,
		function(results) {
			console.log(results);
		},
		function(errorText) {
			console.log(errorText);
		}
	);
	```

**Node.js**

```
// Dependency to https package
var https = require("https");

var Cypher = require("Cypher.min.js").Cypher;

var options = {

	// In Node.js the runInWebWorker option must be set to false
	// Web Workers are not supported in Node.js
	runInWebWorker: false,

	// In Node.js a proxy is not needed
	dataDownloadProxy: null

};
var cypher = new Cypher(true);

cypher.execute(
	'unwind range(0,10) as item return item',
	function(results) {
		console.log(JSON.stringify(results));
	},
	function(error) {
		console.log(error);
	}
);
```
