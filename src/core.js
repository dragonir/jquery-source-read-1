/**
 * jQuery核心
 */

define(["./var/arr", "./var/document", "./var/getProto", "./var/slice", "./var/concat", "./var/push", "./var/indexOf",
    "./var/class2type", "./var/toString", "./var/hasOwn", "./var/fnToString", "./var/ObjectFunctionString",
    "./var/support", "./var/isWindow", "./core/DOMEval"
], function (arr, document, getProto, slice, concat, push, indexOf,
             class2type, toString, hasOwn, fnToString, ObjectFunctionString,
             support, isWindow, DOMEval) {
    "use strict";

    var version = "@VERSION";       //jQuery版本号

    /**
     * jQuery工厂函数
     * @param   selector    {selector}  选择器
     * @param   context     {Object}    上下文对象
     * @returns             {*}         返回一个独立的jQuery实例
     */
    var jQuery = function (selector, context) {
        //实质上是调用了init方法,每次调用构建出新的jQuery实例
        //实现无new构建
        return new jQuery.fn.init(selector, context);
    };

    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,   //匹配BOM字符和&nbsp;
        rmsPrefix = /^-ms-/,                            //匹配 -ms- 前缀
        rdashAlpha = /-([a-z])/g;                       //匹配 - 后第一个字母

    //$.camelCase的callback,用于字母小写转大写
    var fcamelCase = function (all, letter) {
        return letter.toUpperCase();
    };

    //jQuery对象原型
    //jQuery原型上的各方法实现的核心是jQuery对象是一个类数组的对象,可对其进行一些数组操作
    jQuery.fn = jQuery.prototype = {
        jquery: version,
        constructor: jQuery,
        length: 0,

        //返回一个包含jQuery对象集合中的所有DOM元素的数组
        toArray: function () {
            return slice.call(this);
        },

        //获取集合中的第num个元素
        //[注] get方法返回的是DOM元素对象,而非jQuery对象
        get: function (num) {
            if (num == null) {
                return slice.call(this);        //当num为null时,行为与$.toArray相同
            }
            //从集合中返回一个DOM元素
            return num < 0 ? this[num + this.length] : this[num];
        },

        //将传入的元素构建为一个新的jQuery实例
        pushStack: function (elems) {
            //this.constructor() === $(),此处调用构造函数,得到一个新的jQuery实例
            //再使用merge方法将传入的元素合并到新的实例中
            var ret = jQuery.merge(this.constructor(), elems);
            ret.prevObject = this;          //将原实例存到新实例的prevObject属性中
            return ret;
        },

        //遍历jQuery实例，为每个匹配元素执行一个函数
        each: function (callback) {
            return jQuery.each(this, callback);
        },

        //通过一个函数匹配当前集合中的元素,返回一个包含匹配集合的jQuery实例
        map: function (callback) {
            //[重写] 增加中间变量,以方便理解
            var elems = jQuery.map(this, function (elem, i) {
                //通过call改变callback的调用者,使得callback中的this指向elem
                return callback.call(elem, i, elem);
            });
            return this.pushStack(elems);
        },

        //根据指定的下标范围，过滤匹配的元素集合，并返回一个新的jQuery实例
        slice: function () {
            //[重写] 增加中间变量
            //利用Array.slice,得到一个DOM数组
            var elems = slice.apply(this, arguments);
            return this.pushStack(elems);
        },

        //第一个元素
        first: function () {
            return this.eq(0);
        },

        //最后一个元素
        last: function () {
            return this.eq(-1);
        },

        //返回一个只包含第i个元素的jQuery实例
        eq: function (i) {
            //[重写] 让j的取值过程更易读
            var len = this.length,
                j = i < 0 ? i + len : i;

            var elems = (j >= 0 && j < len) ? [this[j]] : [];
            return this.pushStack(elems);
        },

        //返回jQuery实例以前状态
        end: function () {
            //this.pervObject中存储的是实例的上一个状态
            return this.prevObject || this.constructor();
        },

        push: push,
        sort: arr.sort,
        splice: arr.splice
    };

    /**
     * 用于拓展jQuery或合并对象
     * @param   deep        {Boolean}   是否进行深拷贝
     * @param   target      {Object}    目标对象
     * @param   object      {Object}    源对象
     *
     * 当只有target为唯一参数时,将其作为源对象,用于拓展jQuery
     * 利用JS中this永远指向调用者的特性,当调用$.fn.extend时,将拓展jQuery原型
     */
    jQuery.extend = jQuery.fn.extend = function () {
        //[重写] 修改了变量定义的位置,方便阅读

        var target = arguments[0] || {},                //目标对象
            length = arguments.length,                  //参数数量
            deep = false,                               //深拷贝标记
            i = 1;                                      //第一个源对象在arguments中的位置

        //利用typeof实现方法重载
        if (typeof target === "boolean") {
            deep = target;                      //修改深拷贝标记
            target = arguments[i] || {};        //修改目标对象引用
            i++;                                //位置后移
        }

        //当目标不是对象或函数时
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};                        //目标指向一个空对象
        }

        //当只传入一个对象时,则拓展jQuery自身
        if (i === length) {
            target = this;          //目标指向调用者, $或者$.fn
            i--;                    //位置前移
        }

        //开始进行拷贝
        for (; i < length; i++) {
            var options = arguments[i];             //源对象

            if (options != null) {
                for (var name in options) {
                    var src = target[name];         //目标属性
                    var copy = options[name];       //源属性

                    //当嵌套数组或对象深拷贝完成时,跳出此次循环
                    if (target === copy) {
                        continue;
                    }

                    var copyIsArray = Array.isArray(copy);
                    var clone;

                    //深拷贝, 当源对象中嵌套有数组或对象
                    if (deep && copy && (jQuery.isPlainObject(copy) || copyIsArray)) {
                        if (copyIsArray) {          //数组拷贝
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        } else {                    //对象拷贝
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        //递归调用完成深拷贝
                        target[name] = jQuery.extend(deep, clone, copy);

                        //对于基础数据类型或者非深拷贝的场景
                    } else if (copy !== undefined) {
                        target[name] = copy;            //拷贝覆盖
                    }
                }
            }
        }

        return target;      //返回修改后的对象
    };

    //jQuery工具方法
    jQuery.extend({
        expando: "jQuery" + ( version + Math.random() ).replace(/\D/g, ""),     //随机生成唯一标识符
        isReady: true,              //加载完成状态标识

        //接受一个字符串，并抛出包含这个字符串的异常
        error: function (msg) {
            throw new Error(msg);
        },

        //空函数
        noop: function () {
        },

        //检查是否为一个函数
        isFunction: function (obj) {
            //在某些浏览器中,使用typeof判断DOM对象时也会返回 "function"
            //所以需要再判断一次obj.nodeType属性
            return typeof obj === "function" && typeof obj.nodeType !== "number";
        },

        //检查是否为一个数字
        isNumeric: function (obj) {
            var type = jQuery.type(obj);

            return ( type === "number" || type === "string" ) &&
                //排除掉不能完整转换为数字的字符串
                !isNaN(obj - parseFloat(obj));
        },

        //检查是否是纯粹的对象(通过new Object或者{}创建)
        isPlainObject: function (obj) {
            //toString.call等同于Object.prototype.toString
            if (!obj || toString.call(obj) !== "[object Object]") {
                return false;
            }

            //getProto等同于Object.getPrototypeOf
            var proto = getProto(obj);              //对象的原型

            //没有原型的对象
            if (!proto) {
                return true;
            }

            //hasOwn等同于Object.hasOwnProperty
            var Ctor = hasOwn.call(proto, "constructor") && proto.constructor;      //得到对象原型的构造器

            //fnToString等同于Function.toString
            //ObjectFunctionString === Object函数
            //此处判断构造器是否为Object函数,来确定是否为存粹的对象
            return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
        },

        //检查是否是空对象
        isEmptyObject: function (obj) {
            for (var name in obj) {
                return false;
            }
            return true;
        },

        //返回参数的类型
        type: function (obj) {
            //null和undefined的处理
            if (obj == null) {
                return obj + "";
            }

            return typeof obj === "object" || typeof obj === "function" ?
                class2type[toString.call(obj)] || "object" :            //得到具体的对象类型
                typeof obj;                                             //基础数据类型
        },

        //在全局上下文中执行一段JS代码
        globalEval: function (code) {
            DOMEval(code);
        },

        //将字符串转换为小驼峰写法,主要应用于对CSS属性的处理
        camelCase: function (string) {
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },

        //通用的迭代函数
        each: function (obj, callback) {
            var i;

            if (isArrayLike(obj)) {                 //数组或类数组对象
                var length = obj.length;
                for (i = 0; i < length; i++) {      //通过length遍历
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {                                //非数组或类数组对象
                for (i in obj) {                    //通过key遍历
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }

            return obj;
        },

        //去掉字符串头尾的空格
        trim: function (text) {
            return text == null ? "" : ( text + "" ).replace(rtrim, "");
        },

        //将类数组对象转为Array
        makeArray: function (arr, results) {
            var ret = results || [];

            if (arr != null) {
                //数组或类数组对象时
                if (isArrayLike(Object(arr))) {
                    //字符串也属于类数组对象
                    //若直接调用merge进行合并,字符串会被按字符拆分
                    var makeArrayTemp = typeof arr === "string" ? [arr] : arr;
                    jQuery.merge(ret, makeArrayTemp);           //合并数组
                } else {
                    push.call(ret, arr);            //对于其他类型的数据,直接push到ret中
                }
            }
            return ret;
        },

        //在数组中查找值并返回它的索引
        inArray: function (elem, arr, i) {
            return arr == null ? -1 : indexOf.call(arr, elem, i);
        },

        //合并两个数组内容到第一个数组
        merge: function (first, second) {
            var len = second.length,
                i = first.length;

            for (var j = 0; j < len; j++) {
                first[i++] = second[j];
            }

            first.length = i;
            return first;
        },

        //查找满足过滤函数条件的数组元素
        //invert参数为true时将倒置通过的条件,即callback返回为false是才加入结果集中
        grep: function (elems, callback, invert) {
            var matches = [],
                length = elems.length;

            for (var i = 0; i < length; i++) {
                if (callback(elems[i], i) === !invert) {
                    matches.push(elems[i]);
                }
            }
            return matches;
        },

        //将一个数组中的所有元素转换到另一个数组中
        map: function (elems, callback, arg) {
            var value, i, ret = [];

            if (isArrayLike(elems)) {                       //数组或类数组对象
                var length = elems.length;
                for (i = 0; i < length; i++) {              //通过length遍历
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else {                                        //非数组或类数组对象
                for (i in elems) {                          //通过key遍历
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            }

            return concat.apply([], ret);                   //平铺嵌套数组
        },

        guid: 1,        //全局GUID计数器

        //返回一个新函数并将其内部的this指向context
        proxy: function (fn, context) {
            //jQuery.proxy(context, name)的处理
            if (typeof context === "string") {
                var tmp = fn[context];
                context = fn;
                fn = tmp;
            }

            //若fn不是函数则返回undefined
            if (!jQuery.isFunction(fn)) {
                return undefined;
            }

            var args = slice.call(arguments, 2);        //得到additionalArguments

            //新的函数实现
            var proxy = function () {
                //利用applay实现修改函数内this的指向
                return fn.apply(context || this, args.concat(slice.call(arguments)));
            };

            //使用guid标明两个函数之间的对应关系
            //使得可以用原函数来取消绑定
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;

            return proxy;
        },

        now: Date.now,              //当前UNIX时间戳
        support: support            //浏览器能力检测
    });

    //检测Symbol是否被浏览器支持
    if (typeof Symbol === "function") {
        //[存疑]
        jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
    }

    //初始化class2type, 用于类型判别
    //初始化后的形式: [object Array]:"array"
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    //检查是否是数组或类数组对象
    function isArrayLike(obj) {
        var length = !!obj && "length" in obj && obj.length,
            type = jQuery.type(obj);

        if (jQuery.isFunction(obj) || isWindow(obj)) {
            return false;
        }

        return type === "array" || length === 0 ||
            //检查是否可以通过索引访问元素
            typeof length === "number" && length > 0 && ( length - 1 ) in obj;
    }

    return jQuery;
});
