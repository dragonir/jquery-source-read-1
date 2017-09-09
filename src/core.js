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

    jQuery.extend({

        // Unique for each copy of jQuery on the page
        expando: "jQuery" + ( version + Math.random() ).replace(/\D/g, ""),

        // Assume jQuery is ready without the ready module
        isReady: true,

        error: function (msg) {
            throw new Error(msg);
        },

        noop: function () {
        },

        //判断是否为一个函数
        isFunction: function (obj) {
            //在某些浏览器中,使用typeof判断DOM对象时也会返回 "function"
            //所以需要再判断一次obj.nodeType属性
            return typeof obj === "function" && typeof obj.nodeType !== "number";
        },

        isNumeric: function (obj) {

            // As of jQuery 3.0, isNumeric is limited to
            // strings and numbers (primitives or objects)
            // that can be coerced to finite numbers (gh-2662)
            var type = jQuery.type(obj);
            return ( type === "number" || type === "string" ) &&

                // parseFloat NaNs numeric-cast false positives ("")
                // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
                // subtraction forces infinities to NaN
                !isNaN(obj - parseFloat(obj));
        },

        //判断对象是否是纯粹的对象(通过new Object或者{}创建)
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

        isEmptyObject: function (obj) {

            /* eslint-disable no-unused-vars */
            // See https://github.com/eslint/eslint/issues/6125
            var name;

            for (name in obj) {
                return false;
            }
            return true;
        },

        type: function (obj) {
            if (obj == null) {
                return obj + "";
            }

            // Support: Android <=2.3 only (functionish RegExp)
            return typeof obj === "object" || typeof obj === "function" ?
                class2type[toString.call(obj)] || "object" :
                typeof obj;
        },

        // Evaluates a script in a global context
        globalEval: function (code) {
            DOMEval(code);
        },

        // Convert dashed to camelCase; used by the css and data modules
        // Support: IE <=9 - 11, Edge 12 - 15
        // Microsoft forgot to hump their vendor prefix (#9572)
        camelCase: function (string) {
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },

        each: function (obj, callback) {
            var length, i = 0;

            if (isArrayLike(obj)) {
                length = obj.length;
                for (; i < length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }

            return obj;
        },

        // Support: Android <=4.0 only
        trim: function (text) {
            return text == null ?
                "" :
                ( text + "" ).replace(rtrim, "");
        },

        // results is for internal usage only
        makeArray: function (arr, results) {
            var ret = results || [];

            if (arr != null) {
                if (isArrayLike(Object(arr))) {
                    jQuery.merge(ret,
                        typeof arr === "string" ?
                            [arr] : arr
                    );
                } else {
                    push.call(ret, arr);
                }
            }

            return ret;
        },

        inArray: function (elem, arr, i) {
            return arr == null ? -1 : indexOf.call(arr, elem, i);
        },

        // Support: Android <=4.0 only, PhantomJS 1 only
        // push.apply(_, arraylike) throws on ancient WebKit
        merge: function (first, second) {
            var len = +second.length,
                j = 0,
                i = first.length;

            for (; j < len; j++) {
                first[i++] = second[j];
            }

            first.length = i;

            return first;
        },

        grep: function (elems, callback, invert) {
            var callbackInverse,
                matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;

            // Go through the array, only saving the items
            // that pass the validator function
            for (; i < length; i++) {
                callbackInverse = !callback(elems[i], i);
                if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }

            return matches;
        },

        // arg is for internal usage only
        map: function (elems, callback, arg) {
            var length, value,
                i = 0,
                ret = [];

            // Go through the array, translating each of the items to their new values
            if (isArrayLike(elems)) {
                length = elems.length;
                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);

                    if (value != null) {
                        ret.push(value);
                    }
                }

                // Go through every key on the object,
            } else {
                for (i in elems) {
                    value = callback(elems[i], i, arg);

                    if (value != null) {
                        ret.push(value);
                    }
                }
            }

            // Flatten any nested arrays
            return concat.apply([], ret);
        },

        // A global GUID counter for objects
        guid: 1,

        // Bind a function to a context, optionally partially applying any
        // arguments.
        proxy: function (fn, context) {
            var tmp, args, proxy;

            if (typeof context === "string") {
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }

            // Quick check to determine if target is callable, in the spec
            // this throws a TypeError, but we will just return undefined.
            if (!jQuery.isFunction(fn)) {
                return undefined;
            }

            // Simulated bind
            args = slice.call(arguments, 2);
            proxy = function () {
                return fn.apply(context || this, args.concat(slice.call(arguments)));
            };

            // Set the guid of unique handler to the same of original handler, so it can be removed
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;

            return proxy;
        },

        now: Date.now,

        // jQuery.support is not used in Core but other projects attach their
        // properties to it so it needs to exist.
        support: support
    });

    if (typeof Symbol === "function") {
        jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
    }

// Populate the class2type map
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
        function (i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

    function isArrayLike(obj) {

        // Support: real iOS 8.2 only (not reproducible in simulator)
        // `in` check used to prevent JIT error (gh-2145)
        // hasOwn isn't used here due to false negatives
        // regarding Nodelist length in IE
        var length = !!obj && "length" in obj && obj.length,
            type = jQuery.type(obj);

        if (jQuery.isFunction(obj) || isWindow(obj)) {
            return false;
        }

        return type === "array" || length === 0 ||
            typeof length === "number" && length > 0 && ( length - 1 ) in obj;
    }

    return jQuery;
});
