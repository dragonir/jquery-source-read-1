/**
 * 将jQuery注册为AMD module
 */

define(["../core"], function (jQuery) {
    "use strict";
    //环境检测
    if (typeof define === "function" && define.amd) {
        //注册为AMD模块
        define("jquery", [], function () {
            return jQuery;
        });
    }
});
