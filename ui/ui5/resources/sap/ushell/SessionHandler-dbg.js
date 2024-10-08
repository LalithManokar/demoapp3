// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/m/VBox",
    "sap/ui/core/library",
    "sap/ushell/ui/launchpad/LoadingDialog",
    "sap/ui/thirdparty/jquery",
    "sap/ui/util/Storage",
    "sap/base/Log"
], function (
    oResources,
    Dialog,
    Button,
    Text,
    JSONModel,
    VBox,
    coreLibrary,
    LoadingDialog,
    jQuery,
    Storage,
    Log
) {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    /**
     * Manages the timeout of an FLP session
     * - Announces user activity to the platform (via UShell container service)
     * - Maintains user activity data on local storage to support multi-browser-tab use cases
     * - Notifies the user once the session is about to end, and gets the option of extending the session.
     *
     * Configuration settings
     *   - sessionTimeoutIntervalInMinutes : Session timeout configured by platform
     *   - keepSessionAliveAlertTimeInMinutes : Time before session timeout to display session keep alive popup
     *   - enableAutomaticLogout : When true the session refresh window is ommited and an automatic logoff perrformed.
     *
     * @param {object} AppLifeCycle The AppLifeCycle service
     */
    var SessionHandler = function (AppLifeCycle) {
        var that = this;

        /**
         * Initialises the sessionHandler and starts it
         *
         * @param {object} oConfig The config of the SessionHandler
         * @private
         */
        this.init = function (oConfig) {

            /** ===== Debugging Hint =====
             *
             * It may be difficult to debug the session timeout monitoring and the
             * corresponding session timeout warning dialog in multiple browser
             * windows, tabs and sessions. In particular when the Internet Explorer
             * is involved.
             *
             * As a help, you may comment out the following lines,
             * or alternatively set a breakpoint and initiate the commands manually
             * in the console.
             *
             *    Log.setLevel(Log.Level.DEBUG);
             *
             *    // Time span after that a session timeout gets triggered when user was inactive             *
             *    oConfig.sessionTimeoutIntervalInMinutes = 1;
             *
             *    // Time span a session timeout warning dialog appears before the actual timeout happens
             *    oConfig.sessionTimeoutReminderInMinutes = 0.75;
             *
             *    // Automatic signout or reload request dialog (undefined->false)
             *    oConfig.enableAutomaticSignout = true;
             *
             *    debugger;
             */

            Log.debug("SessionHandler.config.sessionTimeoutIntervalInMinutes: " + oConfig.sessionTimeoutIntervalInMinutes, "", "SessionHandler");
            Log.debug("SessionHandler.config.sessionTimeoutReminderInMinutes: " + oConfig.sessionTimeoutReminderInMinutes, "", "SessionHandler");
            Log.debug("SessionHandler.config.enableAutomaticSignout: " + oConfig.enableAutomaticSignout, "", "SessionHandler");

            // Remember configuration and initialize JSON model for session timeout warning dialog
            this.config = oConfig;
            this.oModel = new JSONModel();

            // Initialize time stamp of last user interaction
            this.putTimestampInStorage(this._getCurrentDate());

            // Register logout handler
            sap.ushell.Container.registerLogout(this.logout);
            this.registerCommHandlers();

            // Define which user events shall extend the current FLP session
            this.attachUserEvents();

            // Initialize timeouts
            if (oConfig.sessionTimeoutIntervalInMinutes > 0) {
                this.initSessionTimeout();
            }
            if (oConfig.sessionTimeoutTileStopRefreshIntervalInMinutes > 0) {
                this.initTileRequestTimeout();
            }
        };

        /**
         * Initialization of the sessionHandling logic
         * Steps:
         *   1. Creating the local storage entry for session handling
         *   2. Setting of the local storage property that maintains the time of the last activity
         *
         * @since 1.70.0
         * @private
         */
        this.initSessionTimeout = function () {
            jQuery.sap.measure.start("SessionTimeoutInit", "Inititialize Session Timeout", "FLP_SHELL");
            // Default is to show the session timeout message box and not doing automatic logout (kiosk mode)
            if (this.config.enableAutomaticSignout === undefined) {
                this.config.enableAutomaticSignout = false;
            }
            if (this.config.sessionTimeoutReminderInMinutes === undefined) {
                this.config.sessionTimeoutReminderInMinutes = 0;
            }
            this.oModel.setProperty("/SessionRemainingTimeInSeconds", this.config.sessionTimeoutReminderInMinutes * 60);
            this.counter = 0;
            this.oKeepAliveDialog = undefined;
            // Related to sessionTimeoutIntervalInMinutes (e.g., 30 minutes)
            // For updating the server
            this.notifyServer();
            this.monitorUserIsInactive();
            jQuery.sap.measure.end("SessionTimeoutInit");
        };

        this.registerCommHandlers = function () {
            AppLifeCycle.registerShellCommunicationHandler({
                "sap.ushell.sessionHandler": {
                    oRequestCalls: {
                        "logout": {
                            isActiveOnly: false,
                            distributionType: ["URL"]
                        },
                        "extendSessionEvent": {
                            isActiveOnly: false,
                            distributionType: ["all"]
                        }
                    },
                    oServiceCalls: {
                        "notifyUserActive": {
                            executeServiceCallFn: function (/*oServiceParams*/) {
                                that.userActivityHandler();
                                return new jQuery.Deferred().resolve().promise();
                            }
                        }
                    }
                }
            });
        };

        /**
         * Monitors if user is not active:
         * Display and handle session timeout warning, initiate session over handling if needed.
         * @since 1.84.0
         * @private
         */
        this.monitorUserIsInactive = function () {

            Log.debug("SessionHandler.monitorInactiveUser : Check started", "*****", "SessionHandler");

            // Calculate current timing
            var iTimeLastInteraction = this.timeLastInteraction(),
                iTimePopup = this.timePopup(),
                iTimeNow = this.timeNow(),
                iTimeOver = this.timeOver(),
                iRemainigTimeUntilDialog = iTimePopup - iTimeNow,
                iTimeSinceLastInteraction = iTimeNow - iTimeLastInteraction;

            Log.debug("SessionHandler.monitorUserIsInactive :: time since last interaction : " + iTimeSinceLastInteraction, "", "SessionHandler");
            Log.debug("SessionHandler.monitorUserIsInactive :: remaining time until dialog : " + iRemainigTimeUntilDialog, "", "SessionHandler");

            // Nothing to do, if not yet time for the session timeout warning dialog
            // ... Schedule next check then
            if (iTimeNow < iTimePopup) {
                setTimeout(this.monitorUserIsInactive.bind(this), iRemainigTimeUntilDialog * 1000);
                return;
            }

            // Otherwise display session timeout warning dialog, if configured
            if (iTimeNow >= iTimePopup && iTimeNow < iTimeOver
                && this.config.sessionTimeoutReminderInMinutes > 0) {

                // Deactivate user activity monitoring if dialog is active
                this.detachUserEvents();

                // Open session timeout warning dialog
                this.oContinueWorkingDialog = this.createContinueWorkingDialog();
                this.oContinueWorkingDialog.open();
                Log.debug("SessionHandler.monitorUserIsInactive :: Dialog opened", "", "SessionHandler");

                // Handle countdown
                this.monitorCountdown(true);
            }

            // Logout if time user was inactive has been exceeded
            if (iTimeNow >= iTimeOver) {
                Log.debug("SessionHandler.monitorUserIsInactive :: Session over detected", "", "SessionHandler");
                this.handleSessionOver();
                return;
            }

            Log.debug("SessionHandler.monitorInactiveUser :: Check done", "*****", "SessionHandler");
        };

        this.handleSessionOver = function () {
            clearTimeout(this.notifyServerTimer);
            sap.ui.getCore().getEventBus().publish("launchpad", "sessionTimeout");
            if (this.config.enableAutomaticSignout === true) {
                Log.debug("SessionHandler.handleSessionOver :: Automatic signout gets initiated", "", "SessionHandler");
                this.logout();
            } else {
                Log.debug("SessionHandler.handleSessionOver :: Session expired dialog gets opened", "", "SessionHandler");
                this.createSessionExpiredDialog().open();
            }
        };

        this.notifyServer = function () {
            var timeSinceLastActionInMiliSecond = this._getCurrentDate() - new Date(this.getTimestampFromStorage()),
                timeSinceLastActionInMinutes = timeSinceLastActionInMiliSecond / (1000 * 60);
            // Last user action happened during the last sessionTimeoutIntervalInMinutes (e.g., 30 min)
            if (timeSinceLastActionInMinutes <= this.config.sessionTimeoutIntervalInMinutes) {
                // call service keepAlive to prevent server session time out before client session time
                sap.ushell.Container.sessionKeepAlive();

                //send post to isolated
                AppLifeCycle.postMessageToIframeApp("sap.ushell.sessionHandler", "extendSessionEvent", {});
            } else {
                // No activity during last server session length - do nothing
            }
            this.notifyServerTimer = setTimeout(this.notifyServer.bind(this), this.config.sessionTimeoutIntervalInMinutes * 60 * 1000);
        };

        /**
         * Monitors countdown of session timeout warning dialog
         * @param {*} bIsExternalCall Indicates if monitor call is an initial call or a follow-up check
         * @since 1.84.0
         * @private
         */
        this.monitorCountdown = function (bIsExternalCall) {

            // Debugging
            if (bIsExternalCall) {
                Log.debug("SessionHandler.monitorCountdown :: Initiated from outside", "*****", "SessionHandler");
            } else {
                Log.debug("SessionHandler.monitorCountdown :: Initiated from internal call", "**", "SessionHandler");
            }

            // Calculate current timing
            var iTimeLastInteraction = this.timeLastInteraction(),
                iTimePopup = this.timePopup(),
                iTimeNow = this.timeNow(),
                iTimeOver = this.timeOver(),
                iTimeSinceLastInteraction = iTimeNow - iTimeLastInteraction;

            Log.debug("SessionHandler.monitorCountdown :: timeNow : " + iTimeNow, "", "SessionHandler");
            Log.debug("SessionHandler.monitorCountdown :: iTimeLastInteraction : " + iTimeLastInteraction, "", "SessionHandler");
            Log.debug("SessionHandler.monitorCountdown :: timeSinceLastInteraction : " + iTimeSinceLastInteraction, "", "SessionHandler");
            Log.debug("SessionHandler.monitorCountdown :: iTimeOver : " + iTimeOver, "", "SessionHandler");

            // Click the continue working button automatically,
            // if the user has done so in another session already
            // ... Leave monitorCountdown time then
            if (iTimeNow < iTimePopup) {
                Log.debug("SessionHandler.monitorCountdown :: Auto-click", "<=", "SessionHandler");
                this.continueWorkingButtonPressHandler(true);
                return;
            }

            // Count down if there's time remaining
            // ... for the user to decide
            var iRemainingTimeInSeconds = iTimeOver - iTimeNow;
            if (iRemainingTimeInSeconds > 0) {
                // Expose remaining seconds in model for display

                Log.debug("SessionHandler.monitorCountdown :: Remaining seconds : " + iRemainingTimeInSeconds
                    + " - iTimeOver : " + iTimeOver, "", "SessionHandler");

                this.oModel.setProperty("/SessionRemainingTimeInSeconds", iRemainingTimeInSeconds);
                // Check again some time later
                this.remainingTimer = setTimeout(this.monitorCountdown.bind(this, false), 500);
                return;
            }

            // Handle session over if no time left
            // ... User didn't choose to continue working
            if (iRemainingTimeInSeconds <= 0) {
                if (this.oSessionKeepAliveDialog) {
                    this.oSessionKeepAliveDialog.close();
                }
                this.handleSessionOver();
            }

        };

        /**
         * Initialises the tile request timeout
         *
         * @since 1.70.0
         * @private
         */
        this.initTileRequestTimeout = function () {
            jQuery.sap.measure.start("SessionTileStopRequestInit", "Initialize tile request timeout", "FLP_SHELL");
            this.checkStopBackendRequestRemainingTime();
            this.bBackendRequestsActive = true;
            jQuery.sap.measure.end("SessionTileStopRequestInit");
        };

        /**
         * Sets up a timer to cancel all recuring requests by the tiles on the homepage to allow the backend session to timeout
         *
         * @since 1.70.0
         * @private
         */
        this.checkStopBackendRequestRemainingTime = function () {
            var sTimeSinceLastActionInMilliSecond = this._getCurrentDate() - new Date(this.getTimestampFromStorage()),
                sTimeSinceLastActionInMinutes = sTimeSinceLastActionInMilliSecond / (1000 * 60),
                sReminderIntervalInMinutes = this.config.sessionTimeoutTileStopRefreshIntervalInMinutes,
                sRemainingMillisecondsUntilTimeout = (sReminderIntervalInMinutes - sTimeSinceLastActionInMinutes) * 60 * 1000;

            if (sTimeSinceLastActionInMinutes < sReminderIntervalInMinutes) {
                setTimeout(this.checkStopBackendRequestRemainingTime.bind(this), sRemainingMillisecondsUntilTimeout);
            } else if (sReminderIntervalInMinutes > 0) {
                this._setConnectionActive(false);
            }
        };

        /**
         * Close or resume all connection to the backend
         *
         * @param {boolean} active Determines if the connection should be closed or resumed
         *
         * @since 1.70.0
         * @private
         */
        this._setConnectionActive = function (active) {
            this.bBackendRequestsActive = active;
            var oNotificationService = sap.ushell.Container.getService("Notifications");
            if (active) {
                // Do this asynchronously to avoid execution before the update value was written to the local storage
                setTimeout(this.checkStopBackendRequestRemainingTime.bind(this), 0);
                this._setTilesVisibleOnHomepage();
                if (oNotificationService.isEnabled()) {
                    oNotificationService._resumeConnection();
                }
            } else {
                this._setTilesInvisibleOnHomepage();
                if (oNotificationService.isEnabled()) {
                    oNotificationService._closeConnection();
                }
            }
        };

        /**
         * Triggers the visibilty update for tiles on the homepage.
         *
         * @since 1.70.0
         * @private
         */
        this._setTilesVisibleOnHomepage = function () {
            sap.ui.require(["sap/ushell/utils"], function (oUtils) {
                oUtils.handleTilesVisibility();
            });
        };

        /**
         * Sets all tiles on the homepage to invisible.
         * This stops the automatically recurring requests of dynamic and, if the visibility contract was implemented, custom tiles.
         *
         * @returns {Promise} A promises which resolves once all tiles were set invisible
         *
         * @since 1.70.0
         * @private
         */
        this._setTilesInvisibleOnHomepage = function () {
            // Return a promise mainly to make it testable
            return new Promise(function (resolve, reject) {
                sap.ushell.Container.getServiceAsync("LaunchPage").then(function (LaunchPageService) {
                    LaunchPageService.getGroups().then(function (aGroups) {
                        var oEventBus = sap.ui.getCore().getEventBus();

                        aGroups.forEach(function (oGroup) {
                            /* eslint-disable-next-line max-nested-callbacks */
                            LaunchPageService.getGroupTiles(oGroup).forEach(function (oGroupTile) {
                                LaunchPageService.setTileVisible(oGroupTile, false);
                            });
                        });

                        oEventBus.publish("launchpad", "visibleTilesChanged", []); // This will clear the active dynamic tile cache of DashboardLoadingManager
                        resolve();
                    });
                });
            });
        };

        /**
         * Instantiates and validates the support of the local storage, then returns an interface for it.
         * A reference to the storage is kept after a successful instantiation for later use.
         *
         * @returns {Object} The local Storage interface
         * @private
         */
        this.getLocalStorage = function () {
            if (this.oLocalStorage === undefined) {
                var oStorage = new Storage(this.config && this.config.sessionType || Storage.Type.local);
                if (this._isLocalStorageSupported(oStorage)) {
                    this.oLocalStorage = oStorage;
                } else {
                    this.oLocalStorage = false; // Let's not keep creating new instances. If it is failing once it is expected to fail every time this session
                }
            }

            return this.oLocalStorage;
        };

        /**
         * Checks if the local storage is supported by the browser
         *
         * @param {Object} storage The storage interface to be checked
         * @returns {boolean} The result of the check
         * @private
         */
        this._isLocalStorageSupported = function (storage) {
            var bIsSupported;
            try {
                bIsSupported = storage.isSupported();
            } catch (error) {
                bIsSupported = false;
            }

            if (!bIsSupported) {
                Log.warning("SessionHandler._isLocalStorageSupported :: Failed to instantiate local storage handler: "
                    + "Might be disabled by the browser!", "", "SessionHandler");
            }

            return bIsSupported;
        };

        /* ----------------------------------------- User Dialog controls - begin ----------------------------------------- */

        /**
         * Creates and returns a dialog box that announces the user about the remaining time until session timeout
         * and allows the user to renew the session or (depends of configuration) to sign our immediately.
         * The Dialog box structure:
         *   - sap.m.Dialog
         *     - sap.m.VBox (Texts VBox)
         *        - sap.m.Text (Mandatory: Remaining time text)
         *        - sap.m.Text (Optional: Data lost reminder text)
         *     - sap.m.Button (Mandatory: Continue working button)
         *     - sap.m.Button (Optional: Sign Out button)
         *
         * @returns {Object} The session keep alive dialog
         */
        this.createContinueWorkingDialog = function () {

            Log.debug("SessionHandler.createContinueWorkingDialog :: Continue working dialog beeing created", "", "SessionHandler");

            this.oMessageVBox = new VBox();
            this.oSessionKeepAliveLabel = new Text({
                text: {
                    parts: ["/SessionRemainingTimeInSeconds"],
                    formatter: function (iSessionRemainingTimeInSeconds) {
                        var bIsTimeInMinutes = iSessionRemainingTimeInSeconds > 60,
                            sTimeUnits,
                            iSessionRemainingTime,
                            sMessage;

                        sTimeUnits = bIsTimeInMinutes ? oResources.i18n.getText("sessionTimeoutMessage_units_minutes") : oResources.i18n.getText("sessionTimeoutMessage_units_seconds");
                        iSessionRemainingTime = bIsTimeInMinutes ? Math.ceil(iSessionRemainingTimeInSeconds / 60) : iSessionRemainingTimeInSeconds;
                        if (that.config.enableAutomaticSignout) {
                            sMessage = oResources.i18n.getText("sessionTimeoutMessage_kioskMode_main", [iSessionRemainingTime, sTimeUnits]);
                        } else {
                            sMessage = oResources.i18n.getText("sessionTimeoutMessage_main", [iSessionRemainingTime, sTimeUnits]);
                        }
                        return sMessage;
                    }
                }
            });
            this.oMessageVBox.addItem(this.oSessionKeepAliveLabel);

            if (this.config.enableAutomaticSignout === false) {
                this.oLostDataReminder = new Text({
                    text: oResources.i18n.getText("sessionTimeoutMessage_unsavedData")
                });
                this.oMessageVBox.addItem(this.oLostDataReminder);
            }

            this.oSessionKeepAliveLabel.setModel(this.oModel);

            this.oSessionKeepAliveDialog = new Dialog("sapUshellKeepAliveDialog", {
                title: oResources.i18n.getText("sessionTimeoutMessage_title"),
                type: "Message",
                state: ValueState.Warning,
                content: this.oMessageVBox,
                beginButton: this.getContinueWorkingButton(),
                afterClose: function () {
                    this.oSessionKeepAliveDialog.destroy();
                }.bind(this)
            });

            if (this.config.enableAutomaticSignout === true) {
                this.oSignOutButton = new Button({
                    text: oResources.i18n.getText("logoutBtn_title"),
                    tooltip: oResources.i18n.getText("logoutBtn_tooltip"),
                    press: this.logout.bind(this)
                });
                this.oSessionKeepAliveDialog.setEndButton(this.oSignOutButton);
            }

            return this.oSessionKeepAliveDialog;
        };

        this.getContinueWorkingButton = function () {
            return new Button({
                text: oResources.i18n.getText("sessionTimeoutMessage_continue_button_title"),
                press: that.continueWorkingButtonPressHandler.bind(that, false)
            });
        };

        /**
         * Handles the click on the [Continue] button in the session timeout warning dialog:
         * Closes the dialog, extends the session and restarts user activity monitoring.
         * @param {*} isTriggeredBySessionHandler
         *    Tells if the button was clicked by the user or automatically by the session handler
         * @private
         */
        this.continueWorkingButtonPressHandler = function (isTriggeredBySessionHandler) {

            Log.debug("SessionHandler.continueWorkingButtonPressHandler :: Session was extended"
                + isTriggeredBySessionHandler ? "automatically" : "by user", "", "SessionHandler");

            // Close dialog
            if (this.oSessionKeepAliveDialog) {
                this.oSessionKeepAliveDialog.close();
            }
            clearTimeout(this.remainingTimer);

            // Update timestamp of last user interaction
            // ... Only if user explicitly clicked the [continue] button
            if (!isTriggeredBySessionHandler) {
                this.putTimestampInStorage(this._getCurrentDate());
            }

            // Restart monitoring if user is inactive
            this.monitorUserIsInactive();

            // Listen to user events (i.e., keyboard and mouse)
            // ... after they were detached when UserKeepAliveDialog UI was created
            this.attachUserEvents();

            // Send post to isolated
            AppLifeCycle.postMessageToIframeApp("sap.ushell.sessionHandler", "extendSessionEvent", {});
        };

        this.createSessionExpiredDialog = function () {
            this.oSessionExpiredDialog = new Dialog("sapUshellSessioTimedOutDialog", {
                title: oResources.i18n.getText("sessionExpiredMessage_title"),
                type: "Message",
                state: ValueState.Warning,
                content: new Text({ text: oResources.i18n.getText("sessionExpiredMessage_main") }),
                beginButton: this.getReloadButton(),
                afterClose: function () {
                    this.oSessionExpiredDialog.destroy();
                }.bind(this)
            });
            return this.oSessionExpiredDialog;
        };

        this.getReloadButton = function () {
            return new Button({
                text: oResources.i18n.getText("sessionExpiredMessage_reloadPage_button_title"),
                press: function () {
                    that.oSessionExpiredDialog.close();
                    location.reload();
                }
            });
        };

        /* ------------------------------------------ User Dialogs controls - end ------------------------------------------ */

        /**
         * Defines which user actions in the browser extend the FLP session
         */
        this.attachUserEvents = function () {
            jQuery(document).on("mousedown.sessionTimeout mousemove.sessionTimeout", this.userActivityHandler.bind(this));
            jQuery(document).on("keyup.sessionTimeout", this.userActivityHandler.bind(this));
            jQuery(document).on("touchstart.sessionTimeout", this.userActivityHandler.bind(this));
            sap.ushell.Container.getService("AppLifeCycle").attachAppLoaded({}, this.userActivityHandler, this);
        };

        this.detachUserEvents = function () {
            jQuery(document).off("mousedown.sessionTimeout mousemove.sessionTimeout");
            jQuery(document).off("keydown.sessionTimeout");
            jQuery(document).off("touchstart.sessionTimeout");
            sap.ushell.Container.getService("AppLifeCycle").detachAppLoaded(this.userActivityHandler, this);
        };

        /**
         * Puts the time stamp of the latest user interacion into the local storage
         * @param {Date} tTimestamp timestamp of latest user interaction
         * @private
         */
        this.putTimestampInStorage = function (tTimestamp) {

            Log.debug("SessionHandler.putTimestampInStorage :: Timestamp is " + tTimestamp, "", "SessionHandler");

            jQuery.sap.measure.average("SessionTimeoutPutLocalStorage", "Put timestamp in local storage Average", "FLP_SHELL");
            var oLocalStorage = this.getLocalStorage();
            if (oLocalStorage) {
                oLocalStorage.put("lastActivityTime", tTimestamp);
                if (this.bBackendRequestsActive === false) {
                    this._setConnectionActive(true);
                }
            }
            jQuery.sap.measure.end("SessionTimeoutPutLocalStorage");
        };

        this.getTimestampFromStorage = function () {
            var oLocalStorage = this.getLocalStorage();
            if (oLocalStorage) {
                return oLocalStorage.get("lastActivityTime");
            }
            return null;
        };

        /**
         * Returns the current time (as timestamp in seconds)
         * @returns {integer} Timestamp of current time in seconds
         * @since 1.84.0
         * @private
         */
        this.timeNow = function () {
            return Math.floor(Date.now() / 1000);
        };

        /**
         * Returns the time of the last user interaction (as timestamp in seconds)
         * @returns {integer} Timestamp of last user interaction (in seconds)
         * @since 1.84.0
         * @private
         */
        this.timeLastInteraction = function () {
            return Math.floor(new Date(this.getTimestampFromStorage()).getTime()/1000);
        };

        /**
         * Tells when the session is supposed to timeout
         * if no further user interactions should happen from now on
         * @returns {integer} Timestamp a session timeout is going to happen (in seconds)
         * @since 1.84.0
         * @private
         */
        this.timeOver = function () {
            return Math.floor(this.timeLastInteraction()
                + this.config.sessionTimeoutIntervalInMinutes * 60);
        };

        /**
         * Tells when a session timeout warning dialog is going to show up
         * if no further user interactions should happen from now on
         * @returns {integer} timestamp a session timeout warning dialog is going show up (in seconds)
         * @since 1.84.0
         * @private
         */
        this.timePopup = function () {
            return Math.floor(this.timeLastInteraction()
                + this.config.sessionTimeoutIntervalInMinutes * 60
                - this.config.sessionTimeoutReminderInMinutes * 60);
        };

        /**
         * Updates time stamp in the local storage whenever the user
         * did some actions on the UI.
         *
         * The time stamp is updated once a second or less.
         * @private
         */
        this.userActivityHandler = function (/*oEventData*/) {
            if (this.oUserActivityTimer !== undefined) {
                return;
            }

            this.oUserActivityTimer = setTimeout(function () {

                Log.debug("SessionHandler.userActivityHandler :: Timed time stamp update", "", "SessionHandler");

                that.putTimestampInStorage(that._getCurrentDate());
                that.oUserActivityTimer = undefined;
            }, 1000);
        };

        this._getCurrentDate = function () {
            return new Date();
        };

        /**
         * Handle the logout functionality:
         *   1. Detach mouse and keyboard event handlers
         *   2. Clear timeouts
         *   3. Show logout message
         *   4. Perform logout via sap.ushell.Container
         */
        this.logout = function () {

            Log.debug("SessionHandler.logout :: Logout initiated", "", "SessionHandler");

            var oLoading = new LoadingDialog({ text: "" });

            // post the logout event to isolated
            AppLifeCycle.postMessageToIframeApp("sap.ushell.sessionHandler", "logout", {}, true).then(function () {
                that.detachUserEvents();
                clearTimeout(that.oUserActivityTimer);
                clearTimeout(that.remainingTimer);
                clearTimeout(that.notifyServerTimer);
                oLoading.openLoadingScreen();
                oLoading.showAppInfo(oResources.i18n.getText("beforeLogoutMsg"), null);
                sap.ushell.Container.setDirtyFlag(false);
                sap.ushell.Container.defaultLogout();
            });
        };
    };

    return SessionHandler;
}, /* bExport= */ true);
