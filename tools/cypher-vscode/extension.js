const vscode = require('vscode');
const Cypher = require("cypherdotjs");

function activate(context) {
    console.log('Congratulations, your extension "cypher-vscode" is now active!');

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

                    cypher.execute(
                        statement,
                        function(results) {
                            // Create a webview panel to display the results
                            const panel = vscode.window.createWebviewPanel(
                                'cypherResults', // Identifies the type of the webview. Used internally
                                'Cypher Query Results', // Title of the panel displayed to the user
                                vscode.ViewColumn.Beside, // Show the webview beside the current editor
                                {
                                    enableScripts: true // Enable JavaScript in the webview
                                }
                            );

                            // Pass the raw results object to the webview content function
                            panel.webview.html = getWebviewContent(results);
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

function generateTable(output) {
    if (!output || output.length === 0) return '<p>No data available</p>';

    // Get the column headers from the first object keys
    const headers = Object.keys(output[0]);
    
    // Build the table
    let tableHtml = '<table><thead><tr>';
    
    // Generate headers
    headers.forEach(header => {
        tableHtml += '<th>' + header + '</th>';
    });
    tableHtml += '</tr></thead><tbody>';
    
    // Generate rows
    output.forEach(item => {
        tableHtml += '<tr>';
        headers.forEach(header => {
            tableHtml += '<td>' + JSON.stringify(item[header]) + '</td>';
        });
        tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
}

function getWebviewContent(results) {
    const hasGraph = results.graph && results.graph.nodes && results.graph.links;
    const hasOutput = results.output && results.output.length;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cypher Query Results</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 10px;
            }
            .tabs {
                display: flex;
                cursor: pointer;
            }
            .tab {
                padding: 10px;
                background-color: #f0f0f0;
                margin-right: 10px;
                border-radius: 5px 5px 0 0;
            }
            .tab-content {
                display: none;
                padding: 10px;
                border: 1px solid #f0f0f0;
                border-radius: 0 5px 5px 5px;
                background-color: #fff;
            }
            .tab-content.active {
                display: block;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            table, th, td {
                border: 1px solid black;
            }
            th, td {
                padding: 10px;
                text-align: left;
            }
            svg {
                width: 100%;
                height: 600px;
                background-color: #fafafa;
                border: 1px solid #ddd;
                display: block;
                margin: 0 auto;
                cursor: grab;
            }
            .tooltip {
                position: absolute;
                text-align: center;
                width: auto;
                padding: 5px;
                font: 12px sans-serif;
                background: lightgray;
                border: 0px;
                border-radius: 8px;
                pointer-events: none;
                visibility: hidden;
            }
        </style>
    </head>
    <body>
        <h1>Cypher Query Results</h1>
        
        <div class="tabs">
            <div class="tab" onclick="showTab('graph')">Graph</div>
            <div class="tab" onclick="showTab('table')">Table</div>
        </div>
        
        <div id="graph" class="tab-content">
            <h2>Graph Visualization</h2>
            ${hasGraph ? '<svg></svg><div class="tooltip" id="tooltip"></div>' : '<p>No graph data available</p>'}
        </div>
        
        <div id="table" class="tab-content">
            <h2>Output Table</h2>
            ${hasOutput ? generateTable(results.output) : '<p>No output data available</p>'}
        </div>
        
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script>
            const links = ${JSON.stringify(results.graph?.links || [])};
            const nodes = ${JSON.stringify(results.graph?.nodes || [])};
            const tooltip = document.getElementById('tooltip');

            const svg = d3.select("svg"),
                  width = svg.node().getBoundingClientRect().width,
                  height = svg.node().getBoundingClientRect().height,
                  g = svg.append("g");

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(200))
                .force("charge", d3.forceManyBody().strength(-400))
                .force("center", d3.forceCenter(width / 2, height / 2));

            // Allow dragging the entire graph
            svg.call(d3.zoom()
                .extent([[0, 0], [width, height]])
                .scaleExtent([0.5, 5])
                .on("zoom", ({ transform }) => g.attr("transform", transform)))
                .on("mousedown.zoom", null)
                .on("mousemove.zoom", null)
                .on("mouseup.zoom", null);

            // Helper to make multiple edges curved
            const curve = d3.line().curve(d3.curveBasis);

            const linkGroup = g.append("g")
                .attr("class", "links");

            const link = linkGroup.selectAll("path")
                .data(links)
                .enter().append("path")
                .attr("stroke", "#999")
                .attr("stroke-width", 2)
                .attr("fill", "none");

            const linkText = g.append("g")
                .attr("class", "link-labels")
                .selectAll("text")
                .data(links)
                .enter().append("text")
                .attr("dy", -5)
                .text(d => d.type)
                .attr("fill", "#555")
                .on("mouseover", function(event, d) {
                    tooltip.style.visibility = 'visible';
                    tooltip.textContent = JSON.stringify(d.properties, null, 2);
                })
                .on("mousemove", function(event) {
                    tooltip.style.top = (event.pageY - 10) + "px";
                    tooltip.style.left = (event.pageX + 10) + "px";
                })
                .on("mouseout", function() {
                    tooltip.style.visibility = 'hidden';
                });

            const node = g.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("r", 10)
                .attr("fill", "#69b3a2")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("dblclick", unfixNode);

            const nodeLabels = g.append("g")
                .attr("class", "node-labels")
                .selectAll("text")
                .data(nodes)
                .enter().append("text")
                .attr("dy", 3)
                .attr("dx", 12)
                .text(d => d.properties.name)
                .attr("fill", "#333");

            simulation.on("tick", () => {
                link.attr("d", (d) => \`M\${d.source.x},\${d.source.y} L\${d.target.x},\${d.target.y}\`);

                linkText
                    .attr("x", d => (d.source.x + d.target.x) / 2)
                    .attr("y", d => (d.source.y + d.target.y) / 2)
                    .attr("transform", d => {
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                        return \`rotate(\${angle}, \${(d.source.x + d.target.x) / 2}, \${(d.source.y + d.target.y) / 2})\`;
                    });

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                nodeLabels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });

            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
            }

            function unfixNode(event, d) {
                d.fx = null;
                d.fy = null;
            }

            function showTab(tabId) {
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
            }

            // Show the first tab by default
            showTab('graph');
        </script>
    </body>
    </html>
    `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
