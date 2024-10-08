// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview The FESR Enhancer attaches to the Front End Sub-Records tracker by UI5. UI5 tracks rendering and request activities
 * and tries to detect what happens. The ushell FESR Enhancer has then the possibility to overwrite and enhance the result with
 * FLP specific information.
 *
 * @private
 * */

sap.ui.define([
    "sap/ui/performance/trace/FESR",
    "sap/ushell/EventHub",
    "sap/base/Log"
], function (FrontendSubRecords, EventHub, Ui5Log) {
    "use strict";

    var SCENARIOS = {
            HOME_INITIAL: "HOME INITIAL",
            HOME_FROM_APP: "HOME FROM APP",
            FINDER_INITIAL: "FINDER INITIAL",
            APP_INITIAL: "APP INITAL",
            APP_FROM_HOME: "APP FROM HOME",
            APP_FROM_APP: "APP FROM APP"
        };

    var oFesrEnhancer = {
        _trackedEvents: [],
        _detachers: [],
        _fnOriginalOnBeforeCreated: null,

        /**
         * Initializes the enhancer. This includes attaching to sap/ui/performance/trace/FESR#onBeforeCreated and attaching to ushell
         * specific events
         *
         * @private
         */
        init: function () {
            if (FrontendSubRecords.getActive()) {
                this._attachToEventHub("AppRendered", this._enhanceAppDataEvent.bind(this));

                this._fnOriginalOnBeforeCreated = FrontendSubRecords.onBeforeCreated;
                FrontendSubRecords.onBeforeCreated = this._onBeforeCreatedHandler.bind(this);
            }
        },

        /**
         * Resets the enhancer and detaches form sap/ui/performance/trace/FESR and ushell specific events. Clears the state.
         *
         * @private
         */
        reset: function () {
            // undo all attachments
            FrontendSubRecords.onBeforeCreated = this._fnOriginalOnBeforeCreated;
            this._detachers.forEach(function (fnDetacher) {
                fnDetacher();
            });

            // clear state
            this._trackedEvents = [];
            this._detachers = [];
            this._lastFioriIds = undefined;
        },

        _getPerformanceEntries: function (sEventName) {
            return performance.getEntriesByName(sEventName);
        },

        _trackEvent: function (sEventName, oEvent) {
            var oTrackedEvent = {
                    name: sEventName
                };
            this._trackedEvents.push(oTrackedEvent);

            return oTrackedEvent; // may be enhanced later
        },

        _attachToEventHub: function (sEventName, fnEventEnhancer) {
            var that = this,
                oDoable = EventHub.on(sEventName),
                fnHandler;

            if (fnEventEnhancer) {
                fnHandler = function () {
                    // immediately track the event so the order is correct
                    var oTrackedEvent = that._trackEvent(sEventName);
                    // afterwards enhance it, which may even require async calls ...
                    fnEventEnhancer(oTrackedEvent);
                };
            } else {
                fnHandler = this._trackEvent.bind(this, sEventName);
            }

            // attach
            oDoable.do(fnHandler);

            // save detach function for later
            this._detachers.push(oDoable.off);
        },

        _enhanceAppDataEvent: function (oTrackedEvent) {
            var that = this;
            sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                var oManifest,
                    sFioriIds,
                    oCurrentApp = oAppLifeCycleService.getCurrentApplication();

                if (oCurrentApp && oCurrentApp.applicationType === "UI5") {
                    oManifest = oCurrentApp.componentInstance.getManifest();

                    if (oManifest && oManifest["sap.fiori"] && oManifest["sap.fiori"].registrationIds &&
                            oManifest["sap.fiori"].registrationIds.length > 0) {
                        sFioriIds = oManifest["sap.fiori"].registrationIds.reduce(function (sAccumulator, sCurrent) {
                            if (sAccumulator) {
                                sAccumulator += ";" + sCurrent;
                            } else {
                                sAccumulator = sCurrent;
                            }

                            // Note: sap-fiori-id parameter may overwrite the fiori ID, which is currently ignored

                            return sAccumulator;
                        });
                    }

                }

                if (sFioriIds) {
                    // enhance event
                    oTrackedEvent.fioriIds = sFioriIds;
                    // remember IDs so we do not need to iterate all events all the time when we need it
                    that._setLastTrackedFioriIds(sFioriIds);
                } else {
                    // reset remembered fiori ID as different app was rendered now
                    that._setLastTrackedFioriIds();
                }
            }); // Note: Nothing to be done on reject of the service, oTrackedEvent is simply not enhanced

        },

        _setLastTrackedFioriIds: function (sFioriIds) {
            this._lastFioriIds = sFioriIds;
        },
        _getLastTrackedFioriIds: function () {
            return this._lastFioriIds;
        },

        /**
         * Hook for sap/ui/performance/trace/FESR#onBeforeCreated which enhances the oUi5FesrHandle with FLP-specific information.
         * The handler will try to detect selected scenarios like initial Homepage start or direct app start, all other scenarios are
         * ignored.
         *
         * @param {object} oUi5FesrHandle The header information that can be modified
         * @param {string} oUi5FesrHandle.stepName The step name with <Trigger>_<Event>
         * @param {string} oUi5FesrHandle.appNameLong The application name with max 70 chars
         * @param {string} oUi5FesrHandle.appNameShort The application name with max 20 chars
         * @param {integer} oUi5FesrHandle.timeToInteractive The detected end-to-end time of the step
         * @param {object} oUi5Interaction The corresponding interaction object, read-only
         *
         * @returns {object} Modified header information
         *
         * @private
         */
        _onBeforeCreatedHandler: function (oUi5FesrHandle, oUi5Interaction) {
            var oDetectedScenario = this._detectScenario(oUi5FesrHandle, oUi5Interaction, this._trackedEvents),
                sLastFioriId = this._getLastTrackedFioriIds();

            if (sLastFioriId) {
                // Add the latest remembered Fiori ID to every record until a different Fiori ID is set. This is needed to
                // relate interactions tracked afterwards to the started app.
                // Limitiation:
                // The Fiori IDs are also added to not related interactions like FLP button clicks or shell plugin interactions.
                // Still this is considered by S/4 and UI5 to be more helpful then not adding it anywhere.
                oUi5FesrHandle.appNameShort = sLastFioriId;
            }

            if (!oDetectedScenario.scenario) {
                // unknown scenarios cannot be enhanced
                return oUi5FesrHandle;
            }

            return this._enhanceRecord(oDetectedScenario.scenario, {
                stepName: oUi5FesrHandle.stepName,
                appNameLong: oUi5FesrHandle.appNameLong,
                appNameShort: oUi5FesrHandle.appNameShort,
                timeToInteractive: oUi5FesrHandle.timeToInteractive
            }, oDetectedScenario.relatedEvent);
        },

        /**
         * Tries to detect the current scenario based on the given information.
         *
         * @param {object} oUi5FesrHandle The FESR header information
         * @param {object} oUi5Interaction The corresponding interaction object
         * @param {object[]} aTrackedEvents Events the enhancer tracked so far
         *
         * @returns {object} Returns an object which has at least a scenario property. This property may be null if the scenario is unknown.
         *                   There may also be a relatedEvent property if an event was used in order to detect the scenario.
         *
         * @private
         */
        _detectScenario: function (oUi5FesrHandle, oUi5Interaction, aTrackedEvents) {

            function createResultObject (sScenario, oEvent) {
                var oResult = {
                    scenario: sScenario
                };

                if (oEvent) {
                    oResult.relatedEvent = oEvent;
                }

                return oResult;
            }

            if (oUi5FesrHandle.stepName === "undetermined_startup") {
                switch (oUi5FesrHandle.appNameLong) {
                    case "sap.ushell.components.homepage":
                        return createResultObject(SCENARIOS.HOME_INITIAL);
                    case "sap.ushell.components.appfinder":
                        return createResultObject(SCENARIOS.FINDER_INITIAL);
                    default: break;
                }

                // the app is unknown, try to figure out if it is really an app
                if (aTrackedEvents.length > 0 && aTrackedEvents[0].name === "AppRendered") {
                    return createResultObject(SCENARIOS.APP_INITIAL, aTrackedEvents[0]);
                }
            }

            // no scenario detected
            return createResultObject(null);
        },

        /**
         * Takes the given FESR information oIntermediateResult and returns an enhanced version using the given ifnrmation
         *
         * @param {string} sDetectedScenario The detected scenario which is the basis for the enhancement. See SCENARIOS
         * @param {object} oIntermediateResult The header information that can be modified
         * @param {string} oIntermediateResult.stepName The step name with <Trigger>_<Event>
         * @param {string} oIntermediateResult.appNameLong The application name with max 70 chars
         * @param {string} oIntermediateResult.appNameShort The application name with max 20 chars
         * @param {number} oIntermediateResult.timeToInteractive The detected end-to-end time of the step
         * @param {object} oRelatedEvent Event from _trackedEvents array which was used to detect the scenario.
         *
         * @returns {object} enhanced oIntermediateResult
         *
         * @private
         */
        _enhanceRecord: function (sDetectedScenario, oIntermediateResult, oRelatedEvent) {
            switch (sDetectedScenario) {
                case SCENARIOS.HOME_INITIAL:
                    return this._enhanceInitialStart(oIntermediateResult, "FLP@LOAD", "FLP-TTI-Homepage");
                case SCENARIOS.FINDER_INITIAL:
                    return this._enhanceInitialStart(oIntermediateResult, "FLP@LOAD_FINDER", "FLP-TTI-AppFinder");
                case SCENARIOS.APP_INITIAL:
                    return this._enhanceInitialAppStart(oIntermediateResult, "FLP@DEEP_LINK", /* no performance mark*/ null, oRelatedEvent);
                default:
                    break;
            }

            // unknown scenario
            Ui5Log.warning("Unknown scenario at the end of execution, unnecessary code executed",
                null, "sap.ushell.performance.FesrEnhancer");
            return oIntermediateResult;
        },

        _enhanceInitialStart: function (oIntermediateResult, sStepName, sPerformanceMarkName) {
            var oMark,
                oEnhancedFesrHandle = { // without performance mark this is already very helpful for analysis
                    stepName: sStepName,
                    appNameLong: oIntermediateResult.appNameLong,
                    appNameShort: "",
                    timeToInteractive: oIntermediateResult.timeToInteractive
                };

            if (sPerformanceMarkName) {
                // if available also add the exact Time To Interactive
                oMark = this._getPerformanceEntries(sPerformanceMarkName)[0];
                if (oMark) {
                    // in case of initial start, the startTime is most accurate
                    oEnhancedFesrHandle.timeToInteractive = oMark.startTime;
                    return oEnhancedFesrHandle;
                }

                Ui5Log.warning("Scenario '" + sStepName + "' detected but expected performance mark '" +
                    sPerformanceMarkName + "' does not exist",
                    null, "sap.ushell.performance.FesrEnhancer"
                );
            }

            return oEnhancedFesrHandle;
        },

        _enhanceInitialAppStart: function (oIntermediateResult, sStepName, sPerformanceMarkName, oRelatedEvent) {
            var oEnhancedFesrHandle = this._enhanceInitialStart(oIntermediateResult, sStepName, sPerformanceMarkName);

            if (oRelatedEvent && oRelatedEvent.fioriIds) {
                oEnhancedFesrHandle.appNameShort = oRelatedEvent.fioriIds;
            }

            return oEnhancedFesrHandle;
        }

    };

    return oFesrEnhancer;

}, /* bExport= */ true);
