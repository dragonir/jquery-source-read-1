/**
 * jQuery入口文件
 */

define([
    "./core",                               // jQuery核心
    "./selector",                           // 选择器
    "./traversing",                         // 元素筛选
    "./callbacks",                          // callback队列
    "./deferred",                           // Deferred对象
    "./deferred/exceptionHook",             // Deferred对象兼容
    "./core/ready",                         // ready事件
    "./data",                               // 数据存储
    "./queue",                              // 函数队列
    "./queue/delay",                        // 函数队列延时
    "./attributes",                         // 属性操作
    "./event",                              // 事件核心
    "./event/alias",                        // 事件快捷方式
    "./event/focusin",                      // focus和blur事件兼容
    "./manipulation",                       // DOM操作
    "./manipulation/_evalUrl",              // 获取Script
    "./wrap",                               // DOM包裹
    "./css",                                // CSS
    "./css/hiddenVisibleSelectors",         // 可见性选择器
    "./serialize",                          // serialize && serializeArray
    "./ajax",                               // Ajax
    "./ajax/xhr",                           // Ajax基础
    "./ajax/script",                        // getScript基础
    "./ajax/jsonp",                         // jsonp
    "./ajax/load",                          // HTML load
    "./event/ajax",                         // Ajax事件
    "./effects",                            // 动画
    "./effects/animatedSelector",           // 动画选择器
    "./offset",                             // 元素坐标
    "./dimensions",                         // 元素尺寸
    "./deprecated",                         // 已弃用方法
    "./exports/amd",                        // 注册为AMD module
    "./exports/global"                      // 注册到全局
], function (jQuery) {
    "use strict";
    return jQuery;
});