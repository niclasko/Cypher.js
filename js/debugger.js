var Cypher = require("./Cypher.js").Cypher;

var engine = new Cypher();

var statement = `
    unwind range(1,4) as e
    with 1 as t
    return t
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