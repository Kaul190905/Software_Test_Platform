const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                // If it contains $ but not ${ and not $1, $2
                if (line.includes('$')) {
                    // filter out ${
                    let temp = line.replace(/\$\{/g, '');
                    // filter out $1, $2... (for regex)
                    temp = temp.replace(/\$\d/g, '');
                    if (temp.includes('$')) {
                        console.log(fullPath + ':' + (i+1) + ' -> ' + line.trim());
                    }
                }
            });
        }
    }
}

processDir(path.join(process.cwd(), 'src'));
