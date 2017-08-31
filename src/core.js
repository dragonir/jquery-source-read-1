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
     * @param   context     {Object}    上下文对象,一般在使用jQuery构建DOM元素时使用,如:$('<h1></h1>',{"class": "title"})
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

    jQuery.extend = jQuery.fn.extend = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            // Only deal with non-null/undefined values
            if (( options = arguments[i] ) != null) {

                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && ( jQuery.isPlainObject(copy) ||
                            ( copyIsArray = Array.isArray(copy) ) )) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = jQuery.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
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
            //在某些浏览器中,使用typeof判断DOM元素时也会返回 "function"
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

        isPlainObject: function (obj) {
            var proto, Ctor;

            // Detect obvious negatives
            // Use toString instead of jQuery.type to catch host objects
            if (!obj || toString.call(obj) !== "[object Object]") {
                return false;
            }

            proto = getProto(obj);

            // Objects with no prototype (e.g., `Object.create( null )`) are plain
            if (!proto) {
                return true;
            }

            // Objects with prototype are plain iff they were constructed by a global Object function
            Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
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
