const { default: test } = require("node:test");
var Cypher = require("./Cypher.js");

var engine = new Cypher();

var statement = `
    merge (computer:Item{id:"Computer"})
    merge (hdd:Item{id:"HDD"})
    merge (keyboard:Item{id:"Keyboard"})
    merge (motherboard:Item{id:"Motherboard"})
    merge (cpu:Item{id:"CPU"})
    merge (ram:Item{id:"RAM"})
    merge (bus:Item{id:"Bus"})
    merge (hdd)-[:PARENT]->(computer)
    merge (keyboard)-[:PARENT]->(computer)
    merge (motherboard)-[:PARENT]->(computer)
    merge (cpu)-[:PARENT]->(motherboard)
    merge (ram)-[:PARENT]->(motherboard)
    merge (bus)-[:PARENT]->(motherboard)
    with 1 as dummy
    match p=(:Item)-[:PARENT*]->(pid:Item)
    //where not((pid)-[:PARENT]->(:Item))
    unwind nodes(p) as item
    return nodes(p)[0].id, collect(item.id) as item_path
`;

async function run() {
    await engine.execute(
        statement,
        function(results) {
            console.log(JSON.stringify(results.graph));
            console.log(JSON.stringify(results));
        },
        function(error) {
            console.log(error);
        }
    );
}

run();