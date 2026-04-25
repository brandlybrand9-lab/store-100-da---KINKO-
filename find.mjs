import fs from 'fs';
import path from 'path';

function search(dir) {
    if(!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for(const f of files) {
        const full = path.join(dir, f);
        try {
            if(fs.statSync(full).isDirectory()) {
                if(f === 'logs') console.log("Found logs:", full);
                search(full);
            } else if(f === 'overview.txt') {
                console.log("FOUND OVERVIEW:", full);
            }
        } catch(e) {}
    }
}
search('/.gemini');
search(process.cwd());
search('/home');
search('/root');
