/**
 * 将jQuery注册到全局
 */

define(["../core"], function (jQuery, noGlobal) {
    "use strict";

    //保存原始值,以供调用$.noConflict方法时进行还原
    var _jQuery = window.jQuery,
        _$ = window.$;

    /**
     * 释放jQuery对$的控制
     * @param   deep    {Boolean}   当值为true时,同时释放jQuery对window.jQuery的控制
     * @returns         {jQuery}    返回jQuery的引用,用于设置新的jQuery快捷方式
     */
    jQuery.noConflict = function (deep) {
        if (window.$ === jQuery) {
            window.$ = _$;
        }

        if (deep && window.jQuery === jQuery) {
            window.jQuery = _jQuery;
        }

        return jQuery;
    };

    //全局注册
    if (!noGlobal) {
        window.jQuery = window.$ = jQuery;
    }
});
