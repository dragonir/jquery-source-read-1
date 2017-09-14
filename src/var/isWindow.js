/**
 * 检查对象是否是window对象
 */

define(function () {
    "use strict";

    return function isWindow(obj) {
        return obj != null && obj === obj.window;
    };

});
