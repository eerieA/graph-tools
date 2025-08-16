import { Network } from "vis-network";
import keywordExtractor from "keyword-extractor";

let network = null; // store Network instance so we can destroy it on reload

function extractContentfulSnippet(text, maxKeywords = 3) {
    if (!text || typeof text !== "string") return "";

    const keywords = keywordExtractor.extract(text, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
    });

    const snippet = keywords.slice(0, maxKeywords).join(" ");

    if (!snippet) {
        const words = text.split(/\s+/);
        return words.slice(0, maxKeywords).join(" ") + (words.length > maxKeywords ? "…" : "");
    }

    return snippet;
}

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

function clearStatus() {
    const s = document.getElementById("status");
    s.textContent = "";
    s.className = "info";
}
function setStatus(text, kind = "info") {
    const s = document.getElementById("status");
    s.textContent = text;
    s.className = kind;
}

function processData(data) {
    // your original processing logic
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
                const requirement = (choice.Requirements && choice.Requirements.length) ? choice.Requirements[0] : "";
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
                type: "curvedCW",
                roundness: 0.2
            },
            font: { multi: true, align: "top" }
        },
        physics: { enabled: false },
        interaction: { hover: true, multiselect: true }
    };

    // destroy old network if exists
    try {
        if (network) {
            network.destroy();
            // clear the container in case vis-network left artifacts
            container.innerHTML = "";
        }
    } catch (err) {
        console.warn("Error destroying previous network:", err);
    }

    network = new Network(container, dataVis, options);
    setStatus("Loaded – nodes: " + nodes.length + ", edges: " + edges.length, "info");
}

/* ------- Loading helpers ------- */

async function loadFromUrl(url) {
    clearStatus();
    setStatus("Fetching URL…", "info");
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        processData(data);
    } catch (err) {
        console.error(err);
        // CORS can be a common cause; show a helpful message
        setStatus("Failed to load URL: " + err.message, "error");
    }
}

function loadFromFile(file) {
    clearStatus();
    setStatus("Reading file…", "info");
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            processData(data);
        } catch (err) {
            console.error(err);
            setStatus("Invalid JSON in file: " + err.message, "error");
        }
    };
    reader.onerror = (err) => {
        console.error(err);
        setStatus("Failed to read file: " + err, "error");
    };
    reader.readAsText(file);
}

/* ------- UI wiring ------- */

document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const urlInput = document.getElementById("urlInput");
    const loadUrlBtn = document.getElementById("loadUrlBtn");
    const dropzone = document.getElementById("dropzone");

    // file picker
    fileInput.addEventListener("change", (ev) => {
        const f = ev.target.files && ev.target.files[0];
        if (!f) return;
        loadFromFile(f);
    });

    // load URL for the remote json option
    // we don't need this now
    /* loadUrlBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();
        if (!url) {
            setStatus("Enter a URL first", "error");
            return;
        }
        loadFromUrl(url);
    }); */

    // drag and drop
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#94a3b8";
    });
    dropzone.addEventListener("dragleave", () => {
        dropzone.style.borderColor = "";
    });
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "";
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) {
            setStatus("No file dropped", "error");
            return;
        }
        loadFromFile(f);
    });
});
