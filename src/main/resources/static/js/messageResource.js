/**
 * @license
 * messageResource.js - v1.1
 * Copyright (c) 2014, Suhaib Khan
 * http://khansuhaib.wordpress.com
 *
 * messageResource.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

/**
 * @author Suhaib Khan http://khansuhaib.wordpress.com
 * @version 1.1
 */
(function(global){
    'use strict';

    /**
     * Module with methods for loading and using message resource
     * property files in javascript.
     * @module messageResource
     */
    var messageResource = (function(){


        var properties,
            DEFAULT_MODULE_NAME = '_default',
            DEFAULT_EXTENSION = '.properties',
            filePath,
            fileExtension,
            defaultLocale = 'en_US',
            currentLocale = defaultLocale,
            fileNameResolver,
            ajaxFunction,
            validConfiguration = false,
            debugMode = false;

        /**
         * Default file name resolver.
         *
         * @param {String} module - Module name.
         * @param {String} locale - Locale identifier like en_US.
         * @return {String} File name.
         * @private
         */
        function defaultFileNameResolver(module, locale){
            return (locale && typeof locale === 'string') ?
                module + '_' + locale : module;
        }

        /**
         * Parse and save a message resource file to properties.
         *
         * @param {String} text - Contents of message resource file.
         * @param {String} module - A valid module name.
         * @param {String} locale - A valid locale identifier.
         * @private
         */
        function saveFile(text, module, locale){
            var linesArray,
                curModuleMap;
            text = '' + text;

            if (!text){
                log('Invalid contents.');
                return;
            }
            properties = properties || {};
            properties[locale] = properties[locale] || {};
            properties[locale][module] = properties[locale][module] || {};
            curModuleMap = properties[locale][module];
            linesArray = text.split('\n');
            if (linesArray){
                linesArray.forEach(function (line, index, array){
                    var keyValPair,
                        value = '';

                    line = line.trim();
                    if (line === '' || line.charAt(0) === '#'){
                        return;
                    }

                    keyValPair = line.match(/([^=]*)=(.*)$/);
                    if (keyValPair && keyValPair[1]){
                        if (keyValPair[2]){
                            value = keyValPair[2].trim();
                        }
                        curModuleMap[keyValPair[1].trim()] = value;
                    }else{
                        log('Invalid line : ' + line);
                    }
                });
            }
        }

        /**
         * Get a valid locale name. If null is passed,
         * returns default or current configured locale.
         *
         * @param {String} locale - Locale identifier.
         * @return {String} A valid locale identifier.
         * @private
         */
        function getValidLocale(locale){

            if (!locale || typeof locale !== 'string'){
                locale = currentLocale;
            }
            if (locale.indexOf('-') !== -1){
                locale = locale.replace('-', '_');
            }

            return locale;
        }
        /**
         * Check whether a module already loaded.
         *
         * @param {String} module - A valid module name.
         * @param {String} locale - A valid locale identifier.
         * @return {Boolean} Module loaded or not.
         * @private
         */
        function isModuleLoaded(module, locale){
            var moduleLoaded = false;
            if (module && locale){
                moduleLoaded = (properties && properties[locale] &&
                    properties[locale][module]) ? true : false;
            }
            return moduleLoaded;
        }

        /**
         * Convert unicode string to international characters.
         * @param {String} str - String to convert.
         * @return {String} Converted string.
         * @private
         */
        function convertUnicodeString(str) {
            var convertedText = str.replace(/\\u[\dA-Fa-f]{4}/g, function (unicodeChar) {
                return String.fromCharCode(parseInt(unicodeChar.replace(/\\u/g, ''), 16));
            });
            return convertedText;
        }

        /**
         * For logging and alerting error/debug messages.
         *
         * @param {String} msg - Message to display.
         * @param {Boolean} doAlert - Alert message or not.
         * @private
         */
        function log(msg, doAlert){
            if (debugMode && global.console && global.console.log){
                global.console.log('messageResource.js : ' + msg);
            }
            if (doAlert === true){
                alert('messageResource.js : ' + msg);
            }
        }

        /**
         * Get contents of a file using AJAX.
         *
         * @param {String} url - Url to load
         * @param {Function} callback - Callback to be executed after loading.
         * @private
         */
        function ajaxGet(url, callback){

            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === 4) {
                    if(xmlhttp.status === 200){
                        callback(xmlhttp.responseText);
                    }else {
                        callback(xmlhttp.status);
                    }
                }
            };
            xmlhttp.open('GET', url, true);
            xmlhttp.send();
        }

        return {
            /**
             * Initialize messageResource.js
             * @param {Object} config - Configuration object.
             * @param {String} [config.filePath] - Path(directory) of message resource files.
             * @param {String} [config.fileExtension = .properties] - File extension of message resource files.
             * @param {String} [config.defaultLocale = en_US] - Default locale.
             * @param {Function} [config.fileNameResolver = defaultFileNameResolver] - Specify custom file name resolver.
             * @param {Function} [config.ajaxFunction = ajaxGet] - Specify custom ajax function for loading files.
             The function should accept only 2 arguments :
             1. Url/path of the file.
             2. Callback with response text as argument.
             * @param {Boolean} [config.debugMode = false] - Enable/Disble debug mode.
             * @public
             */
            init : function(config){

                config = config || {};
                filePath = config.filePath || '';
                if (filePath && filePath.charAt(filePath.length - 1) !== '/'){
                    filePath = filePath + '/';
                }
                fileExtension = config.fileExtension || DEFAULT_EXTENSION;
                if (fileExtension.charAt(0) !== '.'){
                    fileExtension = '.' + fileExtension;
                }
                config.defaultLocale = getValidLocale(config.defaultLocale);
                defaultLocale = config.defaultLocale;
                currentLocale = config.defaultLocale;
                fileNameResolver = config.fileNameResolver || defaultFileNameResolver;
                ajaxFunction = config.ajaxFunction || ajaxGet;
                debugMode = config.debugMode || false;
                validConfiguration = true;
            },

            /**
             * Set current locale to be used. This configured locale
             * will be used by load and get functions if locale not specified.
             * If current locale is not set config.defaultLocale will be used as
             * current locale, which is en_US by default.
             *
             * @param {Sring} locale - Locale identifier like en_US.
             * @public
             */
            setCurrentLocale : function(locale){
                if (locale && typeof locale === 'string'){
                    currentLocale = locale;
                }
            },

            /**
             * Load a message resource file. The file name is constructed based on
             * the given module name and locale.
             *
             * File name is constructed with default configuration in different cases as follows :
             *
             * case 1 : Module name and locale can be empty or null, then the file name will be
             * 			resolved to _default.properties.
             * case 2 : Module name - HomePage and locale - empty, then file name - HomePage.properties.
             * case 3 : Module name - empty and locale - en_US, then file name - _default_en_US.properties.
             * case 4 : Module name - HomePage and locale - en_US, then file name - HomePage_en_US.properties.
             *
             * The above file name construction logic can be overriden by configuring
             * custom fileNameResolver functions.
             *
             * @param {String | Array} [module = DEFAULT_MODULE_NAME] - Module name or list of module names.
             * @param {String} [locale] - Locale identifier like en_US. Configured
             * 		current locale will be used if not given.
             * @param {Function} callback - Callback to be executed after loading message resource.
             * @public
             */
            load : function(module, callback, locale){

                var fileLocale,
                    validLocale,
                    validModule,
                    modulesToLoad = [],
                    i;

                if (!validConfiguration){
                    log('Invalid configuration - Invoke init method with proper configuration', true);
                    return;
                }

                validModule = module || DEFAULT_MODULE_NAME;
                validLocale = getValidLocale(locale);
                fileLocale = (validLocale === defaultLocale) ? locale : validLocale;

                if (Array.isArray(validModule)){
                    for (i = 0; i < validModule.length; i++){
                        if (validModule[i] &&
                            !isModuleLoaded(validModule[i], validLocale)){
                            modulesToLoad.push(validModule[i]);
                        }
                    }
                }else{
                    // only one module to load
                    if (!isModuleLoaded(validModule, validLocale)){
                        modulesToLoad.push(validModule);
                    }
                }
                if (modulesToLoad.length === 0){
                    if (callback){
                        callback();
                    }
                    return;
                }
                properties = properties || {};
                properties[validLocale] = properties[validLocale] || {};
                var filesLoadedCount  = 0;
                modulesToLoad.forEach(function (modName, index, array){
                    var fileName,
                        fileUrl;
                    fileName = fileNameResolver(modName, fileLocale);
                    fileUrl = filePath + fileName + fileExtension;
                    ajaxFunction(fileUrl, function(text){
                        saveFile(text, modName, validLocale);
                        filesLoadedCount += 1;
                        if (filesLoadedCount === modulesToLoad.length){
                            if (callback){
                                callback();
                            }
                        }
                    });
                });
            },

            /**
             * Get property value from loaded message resource files.
             *
             * @param {String} key - Message resource property key.
             * @param {String} [module = DEFAULT_MODULE_NAME] - Module name
             * @param {String} [locale] - Locale identifier like en_US. Configured
             * 		current locale will be used if not given.
             * @param {String} defaultValue - Default value to return if value not found.
             * 		If defaultValue is empty key will be used as defaultValue.
             * @return {String} Message resource property value if exists else defaultValue passed.
             * @public
             */
            get : function(key, module, locale, defaultValue){
                var validModule,
                    validLocale,
                    moduleObj,
                    value = defaultValue || key;

                validModule = module || DEFAULT_MODULE_NAME;
                validLocale = getValidLocale(locale);
                if (isModuleLoaded(validModule, validLocale)){
                    moduleObj = properties[validLocale][validModule];
                    if (typeof moduleObj[key] !== 'undefined'){
                        value = moduleObj[key];
                    }
                }

                return convertUnicodeString(value);
            }
        };

    }());
    if ( typeof define === 'function' && define.amd ) {
        define([], function() {
            return messageResource;
        });
    }else{
        if (!global.messageResource){
            global.messageResource = messageResource;
        }
    }

}(this));
(function(){
    'use strict';
    if (!Array.prototype.forEach) {

        Array.prototype.forEach = function (callback, thisArg) {

            var T, k;

            if (typeof this === 'undefined' || this === null) {
                throw new TypeError(" this is null or not defined");
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {

                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }
    if(!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
    if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

}());