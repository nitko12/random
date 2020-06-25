var http = require('http'),
    fileSystem = require('fs'),
    path = require('path');
var url = require('url');

var image = new Array(64);

var row = new Array(64);

for (let i = 0; i < 64; i++) {
    row[i] = [255, 0, 0];
}

for (let i = 0; i < 64; i++) {
    image[i] = JSON.parse(JSON.stringify(row))
}

var ips = [];

http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.url.endsWith("/image")) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        var str=JSON.stringify(image);
        res.end(str);
    } else {
        var ip = req.headers['x-forwarded-for'].substring(0, req.headers['x-forwarded-for'].indexOf(','));
        var q = url.parse(req.url, true).query;
        var txt = q.x + " " + q.y + " " + q.r + " " + q.g + " " + q.b;
        if (q.paint == 1) {
            if (ips.indexOf(ip) == -1) {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                if (q.x != null &&
                    q.y != null &&
                    q.r != null &&
                    q.g != null &&
                    q.b != null &&
                    Number.isInteger(parseInt(q.x)) &&
                    Number.isInteger(parseInt(q.y)) &&
                    Number.isInteger(parseInt(q.r)) &&
                    Number.isInteger(parseInt(q.g)) &&
                    Number.isInteger(parseInt(q.b)) &&
                    0 <= q.x && q.x < 64 &&
                    0 <= q.y && q.y < 64 &&
                    0 <= q.r && q.r <= 255 &&
                    0 <= q.g && q.g <= 255 &&
                    0 <= q.b && q.b <= 255) {
                    image[parseInt(q.y)][parseInt(q.x)] = [parseInt(q.r), parseInt(q.g), parseInt(q.b)];
                }
                res.write(txt);
                res.write("<br>go back <a href='https://addOnePixel--nitko12.repl.co'>to site</a>");
                ips.push(ip);
                setTimeout(function () {
                    var index = ips.indexOf(ip);
                    if (index > -1) {
                        ips.splice(index, 1);
                    }
                }, 5 * 60 * 1000);
                res.end();
                console.log("added " + ip + " to ips, ips are " + ips);
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write("U already submitted you're pixel!<br>*your");
                res.write("<br>go back <a href='https://addOnePixel--nitko12.repl.co'>to site</a>");
                res.end();
                console.log(ip + " ip tried to add more pixels!")
            }
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            var filePath = 'client.html';
            var readStream = fileSystem.createReadStream(filePath);
            readStream.pipe(res);
        }
    }
}).listen(8080);