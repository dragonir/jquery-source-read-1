/**
 * 将HTML字符串解析为一个包含DOM元素的数组
 */
define(["../core", "../var/document", "./var/rsingleTag", "../manipulation/buildFragment", "./support"
], function (jQuery, document, rsingleTag, buildFragment, support) {
    "use strict";

    /**
     * 将HTML字符串解析为一个DOM数组
     * @param   data        {String}    用于解析的HTML字符串
     * @param   context     {Element}   DOM元素上下文
     * @param   keepScripts {Boolean}   是否保留脚本
     */
    jQuery.parseHTML = function (data, context, keepScripts) {
        //当不是HTML字符串时返回空数组
        if (typeof data !== "string") {
            return [];
        }
        //利用typeof进行方法重载
        if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
        }

        //当context未指定时,初始化上下文
        if (!context) {
            //当浏览器支持时,创建一个新的document实现
            if (support.createHTMLDocument) {
                context = document.implementation.createHTMLDocument("");
                var base = context.createElement("base");
                base.href = document.location.href;
                context.head.appendChild(base);
            } else {
                context = document;         //使用当前的document作为上下文
            }
        }

        var parsed = rsingleTag.exec(data);     //单标记测试
        var scripts = !keepScripts && [];

        //当HTML字符串为单标记时,直接使用createElement创建元素
        if (parsed) {
            return [context.createElement(parsed[1])];
        }

        //调用buildFragment,创建HTML片段
        parsed = buildFragment([data], context, scripts);

        //移除script
        if (scripts && scripts.length) {
            jQuery(scripts).remove();
        }

        //返回合并后的结果
        return jQuery.merge([], parsed.childNodes);
    };

    return jQuery.parseHTML;
});
