const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const readline = require('readline');

const rootDirectory = path.join(__dirname, 'public');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Which port should the server run on? ', (port) => {
  port = parseInt(port, 10);

  if (isNaN(port) || port <= 0 || port > 65535) {
    console.log('Please enter a valid port number (from 1 to 65535).');
    rl.close();
    return;
  }

  http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    let filePath = path.join(rootDirectory, pathname === '/' ? 'index.html' : pathname);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const mimeType = mime.lookup(filePath);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': mimeType });
          res.end(data);
        }
      });
    });
  }).listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  rl.close();
});
