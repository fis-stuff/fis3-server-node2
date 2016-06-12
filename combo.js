var libmime = require('mime');
var fs = require('fs');
var path = require('path');

module.exports = Combo;

function Combo(config) {
    return function(req, res, next) {
        var url = req.originalUrl;
        var pathStart,
            files = [];

        if(url.indexOf(config.comboBase) > 0) {
            var __tmp = url.split(config.comboBase);
            pathStart = __tmp[0];
            files = __tmp[1].split(config.comboSep);
            files = files.map(function(file) {
                if(file.indexOf('?') > 0) {
                    file = file.substr(0, file.indexOf('?'));
                }
                return file;
            });
            if(files.length > 1) {
                res.set('Content-Type', getContentType(files[0]));
                res.send(getFiles(pathStart, files));
            } else {
                res.sendFile(path.join(config.root, pathStart, files[0]));
            }
        } else {
            next();
        }
    }
    
    function getContentType(url) {
        var ext,
            mt,
            cs;

        ext = path.extname(url).toLowerCase();
        // removing the . when posible
        ext = ext.indexOf('.') === 0 ? ext.slice(1) : ext;
        // computing mime type based on the extension
        mt = (ext && libmime.types[ext]) || 'text/plain';
        // computing charset based on the mime type
        cs = libmime.charsets.lookup(mt, 'UTF-8');

        return (mt + ';charset=' + cs).toLowerCase();
    }

    function getFiles(pathStart, files) {
        var result = '';
        var absfiles = files.map(function(file) {
            return path.join(config.root, pathStart, file);
        })

        absfiles.forEach(function(file, index) {
            try {
                fs.statSync(file).isFile();
                result += fs.readFileSync(file) + '\n';
            } catch(e) {
                console.log(e);
            }
        })

        return result;
    }
}