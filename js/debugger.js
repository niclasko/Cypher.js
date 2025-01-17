var Cypher = require("./Cypher.js");

var engine = new Cypher();

var statement = `
    unwind [
        {type: 'user', message: 'Hello!'},
        {type: 'coach', message: 'Hi! How can I help you today?'},
        {type: 'user', message: 'I am feeling very stressed out.'}
    ] as message
    with message.type as type, collect(message) as messages
    load text from 'http://localhost:8000/llm/query' post {
        messages: [
            {role: "user", content: "How are you?"}
        ],
        max_tokens: 50,
        model: "gpt-4-0125"
    } as dummy
    load text from 'http://localhost:8000/llm/query' post {
        messages: [
            {role: "user", content: "How are you?"}
        ],
        max_tokens: 50,
        model: "gpt-4-0125"
    } as dummy2
    with f\`{stringify(messages, 2)}\` as _text
    return type, size(messages), _text
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