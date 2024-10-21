// Main function to handle the CFG Compiler logic
function CFGCompiler() {
    // Get the input grammar from the textarea
    let inputGrammar = document.getElementById('inputGrammar').value.trim();
    let rules = inputGrammar.split('\n'); // Split grammar rules by newlines

    // Initialize the grammar object to store CFG rules
    let grammar = {}; // Object to store CFG rules

    // Process each grammar rule
    for (let rule of rules) {
        if (rule.trim() === "") continue; // Skip empty lines
        let parts = rule.split('->');
        let lhs = parts[0].trim(); // Left-hand side (non-terminal)
        let rhsOptions = parts[1].trim().split('|').map(option => option.trim().split(/\s+/)); // Multiple RHS options

        // Initialize the LHS in the grammar object if it does not exist
        if (!grammar[lhs]) {
            grammar[lhs] = [];
        }
        
        // Add all RHS options to the list of productions for LHS
        for (let rhs of rhsOptions) {
            grammar[lhs].push(rhs);
        }
    }

    // Display the compiled grammar rules
    displayCompiledGrammar(grammar);

    // Get the input string to parse from the input field
    let inputString = document.getElementById('inputString').value.trim();

    // Generate the parse tree
    let parseTree = generateParseTree(grammar, inputString);
    if (parseTree) {
        displayParseTree(parseTree);
    } else {
        document.getElementById('parseTree').innerHTML = "The string cannot be parsed with the given grammar.";
    }
}

// Function to display the compiled grammar rules
function displayCompiledGrammar(grammar) {
    let output = "Compiled Grammar:\n";
    for (let lhs in grammar) {
        output += lhs + " -> " + grammar[lhs].map(rhs => rhs.join(" ")).join(" | ") + "\n";
    }
    document.getElementById('output').textContent = output;
}

// Function to generate the parse tree using recursive descent parsing
function generateParseTree(grammar, inputString) {
    // Start parsing from the start symbol 'S' at index 0
    let result = parse('S', inputString, 0);

    if (result && result.success && result.index === inputString.length) {
        return result.parseTree; // Return the parse tree if successful and the whole input has been consumed
    } else {
        return null; // Return null if parsing fails
    }

    function parse(lhs, input, index) {
        if (index > input.length) {
            return null; // Cannot parse beyond the input length
        }

        if (lhs === 'ε') {
            return { success: true, index: index, parseTree: { symbol: 'ε', children: [] } };
        }

        if (grammar[lhs]) {
            // lhs is a non-terminal
            for (let rhs of grammar[lhs]) {
                let currentIndex = index;
                let children = [];
                let success = true;

                // Try to parse each symbol in rhs
                for (let symbol of rhs) {
                    if (symbol === 'ε') {
                        // Epsilon production, doesn't consume input
                        children.push({ symbol: 'ε', children: [] });
                    } else if (grammar[symbol]) {
                        // symbol is a non-terminal
                        let result = parse(symbol, input, currentIndex);
                        if (result && result.success) {
                            currentIndex = result.index;
                            children.push(result.parseTree);
                        } else {
                            success = false;
                            break;
                        }
                    } else {
                        // symbol is a terminal
                        if (currentIndex < input.length && input[currentIndex] === symbol) {
                            currentIndex++;
                            children.push({ symbol: symbol, children: [] });
                        } else {
                            success = false;
                            break;
                        }
                    }
                }

                if (success) {
                    return {
                        success: true,
                        index: currentIndex,
                        parseTree: { symbol: lhs, children: children }
                    };
                }
            }
        } else {
            // lhs is a terminal
            if (input[index] === lhs) {
                return {
                    success: true,
                    index: index + 1,
                    parseTree: { symbol: lhs, children: [] }
                };
            } else {
                return null;
            }
        }

        return null; // No match
    }
}

// Function to display the parse tree in a hierarchical text format
function displayParseTree(parseTree) {
    const parseTreeContainer = document.getElementById('parseTree');
    parseTreeContainer.innerHTML = ""; // Clear existing parse tree

    // Recursive function to build the parse tree text representation
    function buildTreeText(node, indent = "", isLast = true) {
        let treeText = indent + (isLast ? "└── " : "├── ") + node.symbol + "\n";

        // Update the indentation for children
        indent += isLast ? "    " : "│   ";

        // Recursively add children nodes if any
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                let isChildLast = (i === node.children.length - 1);
                treeText += buildTreeText(node.children[i], indent, isChildLast);
            }
        }

        return treeText;
    }

    // Generate the parse tree text and display it
    const parseTreeText = buildTreeText(parseTree);
    const pre = document.createElement('pre'); // Using <pre> to preserve formatting
    pre.textContent = parseTreeText;
    parseTreeContainer.appendChild(pre);
}
