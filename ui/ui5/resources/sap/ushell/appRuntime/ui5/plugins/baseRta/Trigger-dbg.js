/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */

sap.ui.define([
	"sap/ui/thirdparty/hasher",
	"sap/ui/core/BusyIndicator",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/BaseRTAPluginStatus",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
], function (
	hasher,
	BusyIndicator,
	PluginStatus,
	AppLifeCycleUtils
) {
	"use strict";
	var STATUS_STARTING = PluginStatus.STATUS_STARTING;
	var STATUS_STARTED = PluginStatus.STATUS_STARTED;
	var STATUS_STOPPING = PluginStatus.STATUS_STOPPING;
	var STATUS_STOPPED = PluginStatus.STATUS_STOPPED;

	function requireStartAdaptation () {
		return new Promise(function (resolve, reject) {
			sap.ui.require(["sap/ui/rta/api/startAdaptation"], resolve, reject);
		});
	}

	var Trigger = function (mConfig) {
		this.mConfig = mConfig;
		this.sStatus = PluginStatus.STATUS_STOPPED;
		this.oStartingPromise = null;
		this.oStoppingPromise = null;
		var oContainer = AppLifeCycleUtils.getContainer();
		oContainer.registerDirtyStateProvider(this._dirtyStateProvider.bind(this));
	};

	Trigger.prototype.errorHandler = function (vError) {
		BusyIndicator.hide();
		if (vError === "Reload triggered") {
			this.sStatus = STATUS_STOPPED;
		}
	};

	Trigger.prototype._startRta = function (oRootControl) {
		this.sStatus = STATUS_STARTING;
		sap.ui.getCore().getEventBus().subscribe(
			"sap.ushell.renderers.fiori2.Renderer",
			"appClosed",
			this._onAppClosed,
			this
		);
		BusyIndicator.show(0);

		return sap.ui.getCore().loadLibraries(["sap.ui.rta"], {async: true})
			.then(requireStartAdaptation.bind(this))
			.then(function (startAdaptation) {
				// when RTA gets started we have to save the current hash to compare on navigation
				this.sOldHash = hasher.getHash();

				var mOptions = {
					rootControl: oRootControl,
					validateAppVersion: this.mConfig.bValidateAppVersion,
					flexSettings: {
						layer: this.mConfig.layer,
						developerMode: this.mConfig.developerMode
					}
				};
				return startAdaptation(
					mOptions,
					this.mConfig.loadPlugins,
					this.mConfig.onStartHandler,
					this.mConfig.onErrorHandler,
					this.mConfig.onStopHandler
				);
			}.bind(this))
			.then(function (oRTA) {
				BusyIndicator.hide();
				this._oRTA = oRTA;
				this.sStatus = STATUS_STARTED;
			}.bind(this))
			.catch(this.mConfig.onErrorHandler);
	};

	Trigger.prototype._stopRta = function () {
		this.sStatus = STATUS_STOPPING;
		return this._oRTA.stop.apply(this._oRTA, arguments).then(function () {
			this.exitRta();
		}.bind(this));
	};

	/**
	 * Turns on the adaption mode of the RTA FLP plugin.
	 * @returns {promise} Resolves when runtime adaptation has started
	 * @private
	 */
	Trigger.prototype.triggerStartRta = function () {
		var oCurrentRunningApp = AppLifeCycleUtils.getCurrentRunningApplication();
		var oRootControl = oCurrentRunningApp.componentInstance;
		var sStatus = this.sStatus;

		switch (sStatus) {
			case STATUS_STARTING:
				break;
			case STATUS_STARTED:
				this.oStartingPromise = Promise.resolve();
				break;
			case STATUS_STOPPING:
				this.oStartingPromise = this.oStoppingPromise
					.then(function () {
						return this._startRta(oRootControl);
					}.bind(this));
				break;
			case STATUS_STOPPED:
				this.oStartingPromise = this._startRta(oRootControl);
				break;
			default:
		}

		if (sStatus !== STATUS_STARTING) {
			this.oStartingPromise.then(function () {
				this.oStartingPromise = null;
			}.bind(this));
		}

		return this.oStartingPromise;
	};

	/**
	 * Stopps the adaption mode of the RTA FLP plugin.
	 * @returns {promise} Resolves when runtime adaptation has stopped
	 * @private
	 */
	Trigger.prototype.triggerStopRta = function () {
		var sStatus = this.sStatus;
		switch (sStatus) {
			case STATUS_STARTING:
				this.oStoppingPromise = this.oStartingPromise.then(function () {
					return this._stopRta.apply(this, arguments);
				}.bind(this));
				break;
			case STATUS_STARTED:
				this.oStoppingPromise = this._stopRta.apply(this, arguments);
				break;
			case STATUS_STOPPING:
				break;
			case STATUS_STOPPED:
				this.oStoppingPromise = Promise.resolve();
				break;
			default:
		}

		if (sStatus !== STATUS_STOPPING) {
			this.oStoppingPromise.then(function () {
				this.oStoppingPromise = null;
			}.bind(this));
		}
		return this.oStoppingPromise;
	};

	/**
	 * Triggers a Message when flex is disabled on FLP start.
	 * @private
	 */
	Trigger.prototype.handleFlexDisabledOnStart = function () {
		sap.ui.require([
			"sap/ui/rta/util/showMessageBox",
			"sap/m/MessageBox"
		],
		function (
			showMessageBox,
			MessageBox
		) {
			showMessageBox(
					this.mConfig.i18n.getText("MSG_FLEX_DISABLED"),
				{
					icon: MessageBox.Icon.INFORMATION,
					title: this.mConfig.i18n.getText("HEADER_FLEX_DISABLED"),
					actions: [MessageBox.Action.OK],
					initialFocus: null,
					isCustomAction: false
				}
			);
		}.bind(this));
	};

	Trigger.prototype._dirtyStateProvider = function () {
		if (this._oRTA && this.sStatus === STATUS_STARTED) {
			var oUshellContainer = AppLifeCycleUtils.getContainer();
			var oURLParsing = oUshellContainer.getService("URLParsing");
			var sHash = hasher.getHash();
			var oParsedNew = oURLParsing.parseShellHash(sHash);
			var oParsedOld = oURLParsing.parseShellHash(this.sOldHash);
			this.sOldHash = sHash;

			if (
				oParsedNew.semanticObject === oParsedOld.semanticObject &&
				oParsedNew.action === oParsedOld.action &&
				oParsedNew.appSpecificRoute !== oParsedOld.appSpecificRoute
			) {
				return false;
			}
			return this._oRTA.canUndo();
		}
		return false;
	};

	Trigger.prototype.exitRta = function () {
		if (this._oRTA) {
			this._oRTA.destroy();
			this.sStatus = STATUS_STOPPED;
			this.oStartingPromise = null;
			this.oStoppingPromise = null;
			this._oRTA = null;
		}
		sap.ui.getCore().getEventBus().unsubscribe("sap.ushell.renderers.fiori2.Renderer", "appClosed", this._onAppClosed, this);
	};

	Trigger.prototype._onAppClosed = function () {
		// If the app gets closed (or navigated away from), RTA should be stopped without saving changes
		// or checking personalization changes (as the app should not be reloaded in this case)
		this.triggerStopRta(/*bDontSaveChanges = */true, /*bSkipCheckPersChanges = */true);
	};

	return Trigger;
}, true);
