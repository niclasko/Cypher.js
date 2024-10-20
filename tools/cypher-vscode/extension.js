const vscode = require('vscode');
const Cypher = require("./Cypher.min.js").Cypher;

function activate(context) {

    console.log('Congratulations, your extension "cypher-vscode" is now active!');
    const outputChannel = vscode.window.createOutputChannel('Cypher Results');

    // Register the command that executes a Cypher script
    const disposable = vscode.commands.registerCommand('cypher-vscode.runCypher', function () {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            // Get the content of the currently opened file
            const document = editor.document;
            const statement = document.getText();

            // Check if the file is a `.cql` file (optional)
            if (document.languageId === 'cypher' || document.fileName.endsWith('.cql')) {
                try {
                    const cypher = new Cypher();

                    outputChannel.clear();

					cypher.execute(
						statement,
						function(results) {
                            // Write the result to the output channel
                            outputChannel.appendLine('Cypher Query Result:');
                            outputChannel.appendLine(JSON.stringify(results, null, 2));

                            // Show the output channel
                            outputChannel.show(true);  // true means the output panel will be focused
						},
						function(error) {
							vscode.window.showErrorMessage(`Error running Cypher: ${error}`);
						}
					);

                    
                } catch (error) {
                    vscode.window.showErrorMessage(`Error running Cypher: ${error.message}`);
                }
            } else {
                vscode.window.showErrorMessage('This is not a Cypher (.cql) file.');
            }
        } else {
            vscode.window.showErrorMessage('No active editor found.');
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};