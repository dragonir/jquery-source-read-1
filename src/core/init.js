/**
 * init方法,用于构建jQuery实例
 */

define(["../core", "../var/document", "./var/rsingleTag", "../traversing/findFilter"
], function (jQuery, document, rsingleTag) {
    "use strict";

    var rootjQuery;                                             //$(document)的引用
    var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;     //匹配HTML标签或#id表达式

    /***
     * init方法
     * @param   selector    {selector}  选择器
     * @param   context     {Object}    上下文对象
     * @param   root        {jQuery}    备用的rootjQuery
     * @returns             {*}         jQuery实例
     */
    var init = jQuery.fn.init = function (selector, context, root) {
        var match,              //匹配模式
            elem;               //匹配到的元素

        //选择器为("" | null | undefined | false)时
        if (!selector) {
            return this;
        }

        //备用的rootjQuery
        root = root || rootjQuery;

        //进入字符串解析
        if (typeof selector === "string") {
            //这里假设以<>开始结束的字符串都是HTML,当符合条件时跳过正则检查
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
                match = [null, selector, null];
            } else {
                /*
                * 这里正则匹配可能有三种结果
                * 1. 当selector为包含HTML标签的字符串时,结果为[selector, HTML, null]
                * 2. 当selector为#id的形式时,结果为[selecor, null, id]
                * 3. 其他形式结果为null
                */
                match = rquickExpr.exec(selector);
            }

            //HTML tag的处理,当执行此分支时,match[1]一般为HTML字符串
            if (match && ( match[1] || !context )) {
                if (match[1]) {
                    //当传入的上下文为jQuery实例时,使用其中的第0个元素
                    //否则直接使用此对象
                    context = context instanceof jQuery ? context[0] : context;

                    //[重写] 增加中间变量

                    //返回根节点文档对象,即document对象
                    var tempContext = context && context.nodeType ?
                        context.ownerDocument || context :
                        document;

                    //调用parseHTML,将HTML字符串转为一组DOM元素
                    var tempHTML = jQuery.parseHTML(match[1], tempContext, true);

                    //合并到合集
                    jQuery.merge(this, tempHTML);

                    //当context是一个普通对象时,如$('<h1></h1>',{"class": "title"})
                    if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                        for (match in context) {
                            if (jQuery.isFunction(this[match])) {
                                //如果属性是jQuery的方法. 执行方法,并将context中的同名属性作为参数传入
                                this[match](context[match]);
                            } else {
                                //若不是方法,则设置属性
                                this.attr(match, context[match]);
                            }
                        }
                    }
                    return this;

                } else {
                    //#id的处理,当执行此分支时,match[2]为id值
                    elem = document.getElementById(match[2]);           //调用原生DOM方法,获取元素

                    if (elem) {
                        this[0] = elem;                                 //将获取的元素加入集合中
                        this.length = 1;
                    }
                    return this;
                }

                // HANDLE: $(expr, $(...))
            } else if (!context || context.jquery) {
                return ( context || root ).find(selector);

                // HANDLE: $(expr, context)
                // (which is just equivalent to: $(context).find(expr)
            } else {
                return this.constructor(context).find(selector);
            }

            // HANDLE: $(DOMElement)
        } else if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;

            // HANDLE: $(function)
            // Shortcut for document ready
        } else if (jQuery.isFunction(selector)) {
            return root.ready !== undefined ?
                root.ready(selector) :

                // Execute immediately if ready is not present
                selector(jQuery);
        }

        return jQuery.makeArray(selector, this);
    };

// Give the init function the jQuery prototype for later instantiation
    init.prototype = jQuery.fn;

// Initialize central reference
    rootjQuery = jQuery(document);

    return init;

});
