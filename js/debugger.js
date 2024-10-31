var Cypher = require("./Cypher.js");

var engine = new Cypher();

var statement = `
    unwind [
        {type: 'user', message: 'Hello!'},
        {type: 'coach', message: 'Hi! How can I help you today?'},
        {type: 'user', message: 'I am feeling very stressed out.'}
    ] as message
    with message.type as type, collect(message) as messages
    load text from "https://raw.githubusercontent.com/niclasko/Cypher.js/refs/heads/master/js/debugger.js" as l
    return type, size(messages)
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