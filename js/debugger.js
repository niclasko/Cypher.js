var Cypher = require("./Cypher.js").Cypher;

var engine = new Cypher();

var statement = `
    return sum(v in [1,2,3] where v > 1) as sum, 1 as one
`;

engine.execute(
    statement,
    function(results) {
        console.log(JSON.stringify(results.graph));
        console.log(JSON.stringify(results));
    },
    function(error) {
        console.log(error);
    }
);