define(function () {
    "use strict";
    //匹配单标签,如$('<h1>'), $('<h1></h1>')
    return ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>)$/i );
});
