#!/usr/bin/env node

const Cypher = require("./js/Cypher.min.js");

if (require.main !== module) {
    // Export Cypher class so it can be used as a module
    module.exports = Cypher;
} else {
    const { exit } = require("process");
    const readline = require('readline');
    const fs = require('fs');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const engine = new Cypher();

    function query(statement, callback) {
        try {
            engine.execute(
                statement,
                function(results) {
                    callback(null, JSON.stringify(results));
                },
                function(error) {
                    callback(error);
                }
            );
        } catch (error) {
            callback(error);
        }
    }

    let args = process.argv.slice(2);  // Get the arguments

    if (args.length == 1) {
        const _input = args[0];
        let statement = '';
        if (fs.existsSync(_input)) {
            statement = fs.readFileSync(_input, 'utf8');
        } else {
            console.error('File not found: ' + _input);
            exit();
        }
        query(statement, function(error, results) {
            if (error) {
                console.error(error);
            } else {
                console.log(results);
            }
            exit();  // Exit only after query is complete
        });
    } else {
        function help() {
            console.log('Welcome to Cypher.js');
            console.log('Type "exit" to quit');
        }

        function shell() {
            rl.question('> ', (statement) => {
                if (statement.trim().toLowerCase() === 'exit') {
                    console.log('Exiting...');
                    rl.close();  // Close the readline interface
                } else {
                    query(statement, function(error, results) {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log(results);
                        }
                        shell();
                    });
                }
            });
        }

        help();
        shell();
    }
}