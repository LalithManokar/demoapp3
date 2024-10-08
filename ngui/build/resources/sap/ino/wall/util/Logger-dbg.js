/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.util.Logger");

(function() {
    "use strict";

    var SAP_WALL_LOG_LEVEL = 3; // 0=None, 1=Fatal, 2=Error, 3=Warning, 4=Info, 5=Debug, 6=All
    var SAP_WALL_DEBUG_LOG = false;

    sap.ino.wall.util.Logger = {

        /* =========================================================== */
        /* begin: API methods */
        /* =========================================================== */

        /**
         * Logs a sapwall fatal message with callee information
         * 
         * @parameter {sMessage} the message to log
         * @public
         */
        fatal : function(sMessage) {
            var ui5LogLevel = jQuery.sap.log.getLevel(), wallLogLevel = SAP_WALL_LOG_LEVEL;

            jQuery.sap.log.setLevel(Math.max(ui5LogLevel, wallLogLevel));
            jQuery.sap.log.fatal("wallFatal: " + sMessage + (SAP_WALL_DEBUG_LOG ? " @ " + this._getCallerInfo() : ""));
            jQuery.sap.log.setLevel(ui5LogLevel);
        },

        /**
         * Logs a sapwall error message with callee information
         * 
         * @parameter {sMessage} the message to log
         * @public
         */
        error : function(sMessage) {
            var ui5LogLevel = jQuery.sap.log.getLevel(), wallLogLevel = SAP_WALL_LOG_LEVEL;

            jQuery.sap.log.setLevel(Math.max(ui5LogLevel, wallLogLevel));
            jQuery.sap.log.error("wallError: " + sMessage + (SAP_WALL_DEBUG_LOG ? " @ " + this._getCallerInfo() : ""));
            jQuery.sap.log.setLevel(ui5LogLevel);
        },

        /**
         * Logs a sapwall warning message with callee information
         * 
         * @parameter {sMessage} the message to log
         * @public
         */
        warning : function(sMessage) {
            var ui5LogLevel = jQuery.sap.log.getLevel(), wallLogLevel = SAP_WALL_LOG_LEVEL;

            jQuery.sap.log.setLevel(Math.max(ui5LogLevel, wallLogLevel));
            jQuery.sap.log.warning("wallWarning: " + sMessage + (SAP_WALL_DEBUG_LOG ? " @ " + this._getCallerInfo() : ""));
            jQuery.sap.log.setLevel(ui5LogLevel);
        },

        /**
         * Logs a sapwall info message with callee information
         * 
         * @parameter {sMessage} the message to log
         * @public
         */
        info : function(sMessage) {
            var ui5LogLevel = jQuery.sap.log.getLevel(), wallLogLevel = SAP_WALL_LOG_LEVEL;

            jQuery.sap.log.setLevel(Math.max(ui5LogLevel, wallLogLevel));
            jQuery.sap.log.info("wallInfo: " + sMessage + (SAP_WALL_DEBUG_LOG ? " @ " + this._getCallerInfo() : ""));
            jQuery.sap.log.setLevel(ui5LogLevel);
        },

        /**
         * Logs a sapwall debug message with callee information
         * 
         * @parameter {sMessage} the message to log
         * @public
         */
        debug : function(sMessage) {
            var ui5LogLevel = jQuery.sap.log.getLevel(), wallLogLevel = SAP_WALL_LOG_LEVEL;

            jQuery.sap.log.setLevel(Math.max(ui5LogLevel, wallLogLevel));
            jQuery.sap.log.debug("wallDebug: " + sMessage + (SAP_WALL_DEBUG_LOG ? " @ " + this._getCallerInfo() : ""));
            jQuery.sap.log.setLevel(ui5LogLevel);
        },

        /* =========================================================== */
        /* end: API methods */
        /* =========================================================== */

        /* =========================================================== */
        /* begin: internal methods */
        /* =========================================================== */

        /**
         * Returns the current callee information extracted from the call stack (file + line number + position) TODO:
         * Works well for Chrome, might have issues on other browsers
         * 
         * @returns {string} the current caller info
         * @private
         */
        _getCallerInfo : function() {
            var fnGetErrorObject = function() {
                try {
                    throw new Error('');
                } catch (oError) {
                    return oError;
                }
            }, oError = fnGetErrorObject(), sCallerLine, sCallerInfo;

            sCallerLine = oError.stack.split("\n")[5];
            if (!sCallerLine) { // when error occurs in evil() then caller info is on position 4
                sCallerLine = oError.stack.split("\n")[4];
            }
            sCallerInfo = (sCallerLine ? sCallerLine.slice(sCallerLine.indexOf("at ") + 2, sCallerLine.length) : "unknown caller");

            if (!sCallerLine) {
                debugger;
            }

            return sCallerInfo.trim();
        },

    /* =========================================================== */
    /* end: internal methods */
    /* =========================================================== */
    };

})();