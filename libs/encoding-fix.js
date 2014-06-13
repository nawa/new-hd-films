var Iconv = require('iconv').Iconv;

Buffer.prototype._$_toString = Buffer.prototype.toString;
Buffer.prototype.toString = function (charset) {
    if (typeof charset == 'undefined' || charset == 'utf8' || charset == 'utf16le' || charset == 'ascii' || charset == 'ucs2' || charset == 'binary' || charset == 'base64' || charset == 'hex') {
        return this._$_toString.apply(this, arguments);
    }
    if(charset === 'windows1251'){
        charset = 'windows-1251'
    }
    if(charset === 'windows-1251'){
        var iconv = new Iconv(charset, 'UTF-8');
        var buffer = iconv.convert(this);
        var args = arguments;
        args[0] = 'utf8';
        return buffer.toString.apply(buffer, args);
    }
    //throw exception;
    return this._$_toString.apply(this, arguments);
}

Buffer._$_isEncoding = Buffer.isEncoding;
Buffer.isEncoding = function (charset) {
    if (typeof charset == 'undefined' || charset == 'utf8' || charset == 'utf16le' || charset == 'ascii' || charset == 'ucs2' || charset == 'binary' || charset == 'base64' || charset == 'hex') {
        return true;
    }
    if(charset === 'windows-1251' || charset === 'windows1251'){
        return true;
    }
}

