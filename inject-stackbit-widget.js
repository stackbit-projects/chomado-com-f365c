#!/usr/bin/env node

console.log("[inject-stackbit-widget.js] injecting stackbit scripts");

const fs = require("fs");
const path = require("path");

const publishDir = process.argv[2];
const stackbitWidgetUrl = process.argv[3];
const stackbitProjectId = process.argv[4];

if (!publishDir || !stackbitWidgetUrl || !stackbitProjectId) {
    throw new Error(
        `[inject-stackbit-widget.js] command must be called with three arguments specifying the location of publish dir, the widget url and project id`
    );
}

function findFilesInDir(startPath, ext) {
    if (!fs.existsSync(startPath)) {
        throw new Error(
            `[inject-stackbit-widget.js] ${startPath} was not found`
        );
    }

    const results = [];
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            results.push(...findFilesInDir(filename, ext));

        } else if (path.extname(filename).substring(1).toLowerCase() === ext) {
            results.push(filename);
        }
    }
    return results;
}

function injectHtmlBeforeHtml(filepath, beforeHtml, injectHtml) {
    let fileHTML = fs.readFileSync(filepath, "utf8");
    const index = fileHTML.indexOf(beforeHtml);
    if (index === -1) {
        return;
    }
    let finalHTML =
        fileHTML.slice(0, index) + injectHtml + fileHTML.slice(index);
    fs.writeFileSync(filepath, finalHTML, "utf8");
}

let pageCount = 0;
findFilesInDir(publishDir, 'html').forEach(file=>{
    let relPath = path.relative(publishDir, file);
    if (relPath.startsWith('admin/')) {
        return;
    }
    pageCount++;
    injectHtmlBeforeHtml(file, "</body>", `<script id="stackbit-widget-init" data-stackbit-project-id="${stackbitProjectId}" src="${stackbitWidgetUrl}"></script>`);
});

console.log(`[inject-stackbit-widget.js] done, injected script to ${pageCount} pages`);
