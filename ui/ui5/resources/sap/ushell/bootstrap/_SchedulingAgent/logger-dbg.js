// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * The logger module logs the state, error and warning history of the "FLP Bootstrap Scheduling Agent" (FBSA).
 * It can be used by all its FBSA sub modules (e.g. loader, scheduler and the scheduling agent itself).
 * There's no need to explicitly log changes of the module, block and step states, as this is done automatically
 * by the FBSA state module.
 *
 * The logger offers a dump function, which can be used interactively in the console of the development tools.
 * Is prints the history on the console and allows filtering for step and block ids.
 *
 * <code>
 * logger.dumpHistory();
 * logger.dumpHistory("Block A");
 * logger.dumpHistory("Step 1");
 * </code>
 *
 * Perspective:
 * > Always log to the standard SAPUI5 log (sap/base/log)
 *
 * Remarks:
 * > Use logger.verboseOff() to deactivate verbose logging.
 *
 * Usage:
 * <code>
 * sap.ui.define([
 *    "sap/ushell/bootstrap/_SchedulingAgent/logger",
 *    "sap/base/util/now"
 * ], function (
 *    logger,
 *    fnNow
 * ) {
 *      ...
 *      logger.clearHistory();
 *
 *      logger.logStatus({
 *          time : fnNow(), // Date.now() is sometimes not that accurate
 *          type : "Step", id : "Step 1", status : "DONE",
 *          parameter : null, remark : "The one and only", byModule : "flpScheduler"
 *      });
 *      ...
 * }, false);

 * </code>
 *
 * @version 1.71.58
 */

sap.ui.define([
    "sap/base/Log"
], function (BaseLog) {
    "use strict";

    /**
     * Holds the state history of modules, blocks and steps
     * errors and warnings
     */
    var aHistory = [];
    var bVerbose = true;
    var sComponentNameForLogging = "FLPScheduler";

    var oLogger = {

        /**
         * Returns the status history array
         * @return {Array<{time:number, type:string, id:string, status:string, parameter:object, remark:string, byModule:string}>} Status history of status objects
         * @protected
         */
        getHistory: function () {
            return aHistory;
        },

        /**
         * Activates verbose logging
         * @return {boolean} Returns true of verbose logging is enabled, false otherwise.
         * @protected
         */
        verboseOn: function () {
            bVerbose = true;
            return (bVerbose === true);
        } ,
        /**
         * Disables verbose logging
         * @return {boolean} Returns true of verbose logging is disabled, false otherwise.
         * @protected
         */
        verboseOff: function () {
            bVerbose = false;
            return (bVerbose === false);
        },
        /**
         * Tells if verbose logging is enabled
         * @return {boolean} // eslint-disable-line requireReturnDescription
         * @protected
         */
        isVerboseOn: function () {
            return (bVerbose === true);
        },

        /**
         * Clears the logging history
         * @protected
         */
        clearHistory: function () {
            aHistory.length = 0;
        },

        /**
         * Dumps the history to the console
         *
         * Use the parameter "id" to filter the history
         * This method is intended only for debugging with the browser's developer tools.
         *
         * @param {string} [id] ID of modul, state or step
         * @return {Array} The history just written to the console
         * @protected
         */
        dumpHistory: function (id) {
            var _aHistory =
                id === undefined
                    ? aHistory
                    : aHistory.filter(function (oEntry) {
                            return oEntry.id === id;
                      });
            console.table(_aHistory); // eslint-disable-line no-console

            return _aHistory;
        },

        /**
         * Logs an error
         * @param {{time:number, type:string, id:string, status:string, parameter:object, remark:string, byModule:string}} theError
         *   State object to log: use fixed values for type, status and byModule as defined in the state module.
         * @return {boolean} true: Indicates a log entry has been written
         * @protected
         */
        logError: function (theError) {
            BaseLog.error(this.stateToString(theError), undefined, sComponentNameForLogging);
            aHistory.push(theError);
            return true;
        },

        /**
         * Logs a warning
         * @param {{time:number, type:string, id:string, status:string, parameter:object, remark:string, byModule:string}} theWarning
         *   State object to log: use fixed values for type, status and byModule as defined in the state module.
         * @return {boolean} true: Indicates a log entry has been written
         * @protected
         */
        logWarning: function (theWarning) {
            if (bVerbose) {
                BaseLog.warning(this.stateToString(theWarning), sComponentNameForLogging);
                aHistory.push(theWarning);
            }
            return bVerbose;
        },

        /**
         * Logs a module's, step's, or block's state.
         *
         * No logging if verbose logging is disabled.
         *
         * @param {{time:number, type:string, id:string, status:string, parameter:object, remark:string, byModule:string}} theStatus
         *   State object to log: use fixed values for type, status and byModule as defined in the state module.
         * @return {boolean} true if log entry has been written
         * @protected
         */
        logStatus: function (theStatus) {
            if (bVerbose) {
                BaseLog.info(this.stateToString(theStatus), sComponentNameForLogging);
                aHistory.push(theStatus);
            }
            return bVerbose;
        },

        /**
         * Formats a status entry for log output
         * @param {Array<{time:number, type:string, id:string, status:string, parameter:object, remark:string, byModule:string}>} status
         *  history of status objects
         * @returns {string} Status as string for log output
         * @protected
         */
        stateToString: function (status) {
            return "FLP Bootstrap Scheduling Agent :: " + status.type + " '" + status.id
            + "' /" + status.status + ((status.remark) ? "/ : " + status.remark : "/") ;
        }

    };

    return oLogger;
}, false );
