import { Network } from "vis-network";
import keywordExtractor from "keyword-extractor";

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

// handle parallel edges, fan them out by applying curvedCW and CCW
// Otherwise vis-network will draw multiple edges between the same node pair on top of each other bcz they have the same curve parameters
function separateParallelEdges(edges) {
    const counts = {};
    for (const e of edges) {
        const key = `${e.from}|${e.to}`;
        counts[key] = (counts[key] || 0) + 1;
    }

    const indices = {};
    for (const e of edges) {
        const key = `${e.from}|${e.to}`;
        const total = counts[key];

        if (total > 1) {
            indices[key] = (indices[key] || 0) + 1;
            const idx = indices[key] - 1;
            const middle = (total - 1) / 2;
            const offset = idx - middle;

            const base = 0.20;
            const step = 0.20;
            const roundness = base + Math.abs(offset) * step;
            const type = offset >= 0 ? "curvedCW" : "curvedCCW";

            e.smooth = { enabled: true, type, roundness };
            e.font = e.font || {};
            e.font.align = offset >= 0 ? "top" : "bottom";
        } else {
            e.smooth = { enabled: true, type: "cubicBezier" };
        }

        if (e.from === e.to) {
            e.smooth = { enabled: true, type: "curvedCW", roundness: 0.6 };
            e.dashes = e.dashes || false;
            e.font = e.font || {};
            e.font.align = "middle";
        }
    }
}


fetch("assets/luka_session_01.json")
    .then(res => res.json())
    .then(data => {
        const nodes = [];
        const edges = [];

        for (const [id, node] of Object.entries(data)) {
            nodes.push({
                id,
                label: node.ID,
                shape: "box",
                color: "#4a90e2",
                font: { multi: true }
            });

            if (node.Choices) {
                for (const choice of node.Choices) {
                    const choiceTextSnippet = extractContentfulSnippet(choice.Text);
                    const requirement = choice.Requirements.length ? choice.Requirements[0] : "";
                    const edgeLabel = requirement ? `${choiceTextSnippet}\n${requirement}` : choiceTextSnippet;

                    if (choice.NextNodeID) {
                        edges.push({
                            from: id,
                            to: choice.NextNodeID,
                            label: edgeLabel,
                            arrows: "to",
                            color: { color: "gray" },
                            font: { multi: true, align: "top" }
                        });
                    }

                    if (choice.FailureNodeID) {
                        edges.push({
                            from: id,
                            to: choice.FailureNodeID,
                            label: "(fail)",
                            arrows: "to",
                            color: { color: "red" },
                            dashes: true
                        });
                    }
                }
            }

            if (node.NextNodeID) {
                edges.push({
                    from: id,
                    to: node.NextNodeID,
                    label: "",
                    arrows: "to",
                    color: { color: "black" }
                });
            }
        }

        separateParallelEdges(edges);

        const container = document.getElementById("network");
        const dataVis = { nodes, edges };
        const options = {
            layout: { hierarchical: { direction: "UD", sortMethod: "directed" } },
            edges: {
                smooth: {
                    type: "curvedCW", // clockwise curve
                    roundness: 0.2    // adjust curvature
                },
                font: { multi: true, align: "top" }
            },
            physics: { enabled: false },
            interaction: { hover: true, multiselect: true }
        };

        new Network(container, dataVis, options);
    });