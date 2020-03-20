# Cypher.js
Cypher.js is a graph database implemented from scratch in Javascript with zero dependencies. It implements the Cypher graph db query language.

For inquiries, reach out to Cypher.js author Niclas Kjäll-Ohlsson (niclas@fusebase.io).

Demos
1. Just for fun: https://bit.ly/2Dbylrh
2. <a href="https://niclasko.github.io/CypherJS/?CREATE%20(water:Molecule%20{name:%22H\u2082O%22}),%20(coa_sh:Molecule%20{name:%22CoA-SH%22}),%20(nad:Molecule%20{name:%22NAD\u207a%22}),%20(nadh:Molecule%20{name:%22NADH%22}),%20(h:Molecule%20{name:%22H\u207a%22}),%20(co2:Molecule%20{name:%22CO\u2082%22}),%20(gdp:Molecule%20{name:%22GDP%22}),%20(gtp:Molecule%20{name:%22GTP%22}),%20(phosphate:Molecule%20{name:%22P\u1d62%22}),%20(ubiquinone:Molecule%20{name:%22ubiquinone%22}),%20(ubiquinol:Molecule%20{name:%22ubiquinol%22}),%20(acetyl_coa:Molecule%20{name:%22Acetyl%20CoA%22}),%20(oxaloacetate:Molecule%20{name:%22Oxaloacetate%22}),%20(r1:Reaction%20{name:1}),%20(citrate:Molecule%20{name:%22Citrate%22}),%20(citrate_synthase:Enzyme%20{name:%22Citrate%20synthase%22}),%20(oxaloacetate)-[:SUBSTRATE]-%3E(r1),%20(acetyl_coa)-[:SUBSTRATE]-%3E(r1),%20(water)-[:SUBSTRATE]-%3E(r1),%20(r1)-[:PRODUCES]-%3E(citrate),%20(r1)-[:PRODUCES]-%3E(coa_sh),%20(citrate_synthase)-[:CATALYSES]-%3E(r1),%20(r2:Reaction%20{name:2}),%20(cis_aconitate:Molecule%20{name:%22cis-Aconitate%22}),%20(aconitase:Enzyme%20{name:%22Aconitase%22}),%20(citrate)-[:SUBSTRATE]-%3E(r2),%20(r2)-[:PRODUCES]-%3E(cis_aconitate),%20(r2)-[:PRODUCES]-%3E(water),%20(aconitase)-[:CATALYSES]-%3E(r2),%20(r3:Reaction%20{name:3}),%20(isocitrate:Molecule%20{name:%22Isocitrate%22}),%20(cis_aconitate)-[:SUBSTRATE]-%3E(r3),%20(water)-[:SUBSRATE]-%3E(r3),%20(r3)-[:PRODUCES]-%3E(isocitrate),%20(aconitase)-[:CATALYSES]-%3E(r3),%20(r4:Reaction%20{name:4}),%20(oxalosuccinate:Molecule%20{name:%22Oxalosuccinate%22}),%20(isocitrate_dehydrogenase:Enzyme%20{name:%22Isocitrate%20dehydrogenase%22}),%20(isocitrate)-[:SUBSTRATE]-%3E(r4),%20(nad)-[:SUBSTRATE]-%3E(r4),%20(r4)-[:PRODUCES]-%3E(oxalosuccinate),%20(r4)-[:PRODUCES]-%3E(nadh),%20(r4)-[:PRODUCES]-%3E(h),%20(isocitrate_dehydrogenase)-[:CATALYSES]-%3E(r4),%20(r5:Reaction%20{name:5}),%20(alpha_ketoglutarate:Molecule%20{name:%22\u03b1-Ketoglutarate%22}),%20(oxalosuccinate)-[:SUBSTRATE]-%3E(r5),%20(r5)-[:PRODUCES]-%3E(alpha_ketoglutarate),%20(r5)-[:PRODUCES]-%3E(co2),%20(isocitrate_dehydrogenase)-[:CATALYSES]-%3E(r5),%20(r6:Reaction%20{name:6}),%20(succinyl_coa:Molecule%20{name:%22Succinyl-CoA%22}),%20(alpha_ketoglutarate_dehydrogenase:Enzyme%20{name:%22\u03b1-Ketoglutarate%20dehydrogenase%22}),%20(alpha_ketoglutarate)-[:SUBSTRATE]-%3E(r6),%20(nad)-[:SUBSTRATE]-%3E(r6),%20(coa_sh)-[:SUBSTRATE]-%3E(r6),%20(r6)-[:PRODUCES]-%3E(succinyl_coa),%20(r6)-[:PRODUCES]-%3E(nadh),%20(r6)-[:PRODUCES]-%3E(h),%20(r6)-[:PRODUCES]-%3E(co2),%20(alpha_ketoglutarate_dehydrogenase)-[:CATALYSES]-%3E(r6),%20(r7:Reaction%20{name:7}),%20(succinate:Molecule%20{name:%22Succinate%22}),%20(succinyl_coa_synthetase:Enzyme%20{name:%22Succinyl-CoA%20synthetase%22}),%20(succinyl_coa)-[:SUBSTRATE]-%3E(r7),%20(gdp)-[:SUBSTRATE]-%3E(r7),%20(phosphate)-[:SUBSTRATE]-%3E(r7),%20(r7)-[:PRODUCES]-%3E(succinate),%20(r7)-[:PRODUCES]-%3E(coa_sh),%20(r7)-[:PRODUCES]-%3E(gtp),%20(succinyl_coa_synthetase)-[:CATALYSES]-%3E(r7),%20(r8:Reaction%20{name:8}),%20(fumarate:Molecule%20{name:%22Fumarate%22}),%20(succinate_dehydrogenase:Enzyme%20{name:%22Succinate%20dehydrogenase%22}),%20(succinate)-[:SUBSTRATE]-%3E(r8),%20(ubiquinone)-[:SUBSTRATE]-%3E(r8),%20(r8)-[:PRODUCES]-%3E(fumarate),%20(r8)-[:PRODUCES]-%3E(ubiquinol),%20(succinate_dehydrogenase)-[:CATALYSES]-%3E(r8),%20(r9:Reaction%20{name:9}),%20(l_malate:Molecule%20{name:%22\u029f-Malate%22}),%20(fumarase:Enzyme%20{name:%22Fumarase%22}),%20(fumarate)-[:SUBSTRATE]-%3E(r9),%20(water)-[:SUBSTRATE]-%3E(r9),%20(r9)-[:PRODUCES]-%3E(l_malate),%20(fumarase)-[:CATALYSES]-%3E(r9),%20(r10:Reaction%20{name:10}),%20(malate_dehydrogenase:Enzyme%20{name:%22Malate%20dehydrogenase%22}),%20(l_malate)-[:SUBSTRATE]-%3E(r10),%20(nad)-[:SUBSTRATE]-%3E(r10),%20(r10)-[:PRODUCES]-%3E(oxaloacetate),%20(r10)-[:PRODUCES]-%3E(nadh),%20(r10)-[:PRODUCES]-%3E(h),%20(malate_dehydrogenase)-[:CATALYSES]-%3E(r10)%20match%20(a)-[r]-%3E(b)%20return%20a,%20r,%20b">Molecule interactions</a>
2. Game of Thrones: https://bit.ly/2QoBSG9
3. Time series analysis: https://bit.ly/2zSQkzt
4. Generate random strings: https://bit.ly/2FoJcAW
5. Bill of material explosion: https://bit.ly/2DoKJE6

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
