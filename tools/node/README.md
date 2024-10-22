# Cypher.js

Cypher.js is a graph database and implementation of the Cypher query language in Javascript. It can be used both as a command-line tool for running Cypher scripts and as a library to be integrated into your Node.js applications.

## Features

- Execute Cypher queries from a script or directly in a shell.
- Command-line interface for processing `.cql` files.
- Usable as a Node.js library for executing queries programmatically.

## Installation

You can install Cypher.js globally to use it as a CLI tool, or locally in your project for programmatic use.

### Global Installation (CLI Tool)

To install globally:

```bash
npm install -g cypherdotjs
```

### Local Installation (Library for your Node.js project)

To add it to your project:

```bash
npm install cypherdotjs
```

## Usage
### 1. Command Line Usage
After installing globally, you can use Cypher.js directly from the command line to execute Cypher queries.

#### Running a .cql file
You can pass a .cql file as an argument to execute its content:

```bash
cypher path/to/your/file.cql
```

#### Interactive Cypher Shell
If you don't provide a file, Cypher.js will enter an interactive shell where you can type Cypher queries manually.

```bash
cypher
```

Once in the shell, you can start typing your queries:
```vbnet
Welcome to Cypher.js
Type "exit" to quit
> MERGE (n:Node{value:"Hello world"}) RETURN n;
```

To exit the shell, type:

```shell
> exit
```
### 2. Library Usage (Programmatic)
You can also use Cypher.js within your Node.js applications by requiring the package.

#### Example: Using Cypher.js in a Script
First, import the Cypher.js library and create an instance:

```javascript
const Cypher = require('cypherdotjs');
const cypher = new Cypher();

// A sample query to execute
const statement = "MERGE (n:Node{value:'Hello world'}) RETURN n";

cypher.execute(statement, (results) => {
    console.log("Query Results:", results);
}, (error) => {
    console.error("Query Error:", error);
});
```

## API
- ```Cypher.execute(query, successCallback, errorCallback)```:
    - Executes the given Cypher query.
    - **query**: A string representing the Cypher query.
    - **successCallback**: A function to handle successful query execution (receives the results).
    - **errorCallback**: A function to handle any errors that occur during execution.

## Contributing
If you'd like to contribute to Cypher.js, feel free to submit a pull request or report an issue on GitHub.

[GitHub Repository](https://github.com/niclasko/Cypher.js)