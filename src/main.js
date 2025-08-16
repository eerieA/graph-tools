import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import keywordExtractor from "keyword-extractor";

cytoscape.use(dagre);

function extractContentfulSnippet(text, maxKeywords = 3) {
    if (!text || typeof text !== "string") return "";

    // Use keyword-extractor to get keywords
    const keywords = keywordExtractor.extract(text, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
    });

    // Take the first N keywords
    const snippet = keywords.slice(0, maxKeywords).join(" ");

    // If no keywords found, fall back to a shortened plain text
    if (!snippet) {
        return text.split(/\s+/).slice(0, maxKeywords).join(" ") + (text.split(/\s+/).length > maxKeywords ? "…" : "");
    }

    return snippet;
}


fetch("assets/luka_session_01.json")
    .then(res => res.json())
    .then(data => {
        const elements = [];

        for (const [id, node] of Object.entries(data)) {
            // Add the node
            elements.push({
                // push a node ele to the graph, with label read from a property of the node data
                data: { id, label: `${node.ID}` }
            });

            // Add edges for Choices
            if (node.Choices) {
                for (const choice of node.Choices) {
                    const choiceTextSnippet = extractContentfulSnippet(choice.Text);
                    console.log("before:", choice.Text);
                    console.log("after:", choiceTextSnippet);
                    
                    const requirementSnippet = choice.Requirements.length > 0 ? choice.Requirements[0] : "";
                    const edgeLabel = requirementSnippet ? `${choiceTextSnippet} | ${requirementSnippet}` : choiceTextSnippet;

                    if (choice.NextNodeID) {
                        elements.push({
                            data: {
                                source: id,
                                target: choice.NextNodeID,
                                label: edgeLabel,
                                type: "choice"
                            }
                        });
                    }

                    if (choice.FailureNodeID) {
                        elements.push({
                            data: {
                                source: id,
                                target: choice.FailureNodeID,
                                label: "(fail)",
                                type: "failure"
                            }
                        });
                    }
                }
            }

            // Add edge for NextNodeID (auto-advance)
            if (node.NextNodeID) {
                elements.push({
                    data: { source: id, target: node.NextNodeID, label: "", type: "flow" }
                });
            }
        }

        // Render Cytoscape
        cytoscape({
            container: document.getElementById("cy"),
            elements,
            style: [
                { selector: "node", style: { "label": "data(label)", "background-color": "#4a90e2" } },
                { selector: "edge", style: { "label": "data(label)", "curve-style": "bezier", "target-arrow-shape": "triangle" } },
                { selector: "edge[type='failure']", style: { "line-color": "red", "target-arrow-color": "red", "line-style": "dashed" } },
                { selector: "edge[type='choice']", style: { "line-color": "gray", "target-arrow-color": "gray", "line-style": "dashed" } }
            ],
            layout: {
                name: "dagre",
                rankDir: "TB",
                nodeSep: 50,
                rankSep: 100
            }
        });
    });
