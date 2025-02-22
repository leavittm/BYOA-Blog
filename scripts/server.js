const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
    // Handle root path
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // First try to serve from public directory
    let publicPath = path.join(__dirname, '../public', filePath);
    
    // Get the file extension
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    // Try public directory first, fall back to root if file not found
    fs.readFile(publicPath, (err, content) => {
        if (err) {
            // If not in public, try root directory
            let rootPath = '.' + filePath;
            fs.readFile(rootPath, (err2, content2) => {
                if (err2) {
                    if (err2.code === 'ENOENT') {
                        // Page not found in either location
                        fs.readFile('./404.html', (err3, content3) => {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            res.end(content3 || 'Page not found', 'utf8');
                        });
                    } else {
                        // Server error
                        res.writeHead(500);
                        res.end(`Server Error: ${err2.code}`);
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content2, 'utf8');
                }
            });
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
}); 