var Cypher = require("./Cypher.js");

var engine = new Cypher();

var statement = `
    load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-nodes.csv" as node
    merge (c:Character{name:node.Id})
    with count(1) as dummy
    load csv with headers from "https://raw.githubusercontent.com/melaniewalsh/sample-social-network-datasets/master/sample-datasets/game-of-thrones/got-edges.csv" as edge
    match (source:Character{name:edge.Source}), (target:Character{name:edge.Target})
    merge (source)-[r:KNOWS{weight:edge.Weight}]->(target)
    return r
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