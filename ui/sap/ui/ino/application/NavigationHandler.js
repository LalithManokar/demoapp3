/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.application.NavigationHandler");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.core.routing.Router");
    jQuery.sap.require("sap.ui.core.routing.History");
    jQuery.sap.require("sap.ui.core.routing.HistoryDirection");
    jQuery.sap.require("sap.ui.core.routing.HashChanger");
    jQuery.sap.require("sap.ui.ino.application.Configuration");

    /**
     * Instantiates a SAP Innovation Management Navigation Handler
     * 
     * @class
     * @extends sap.ui.base.EventProvider
     * 
     * @public
     * @name sap.ui.ino.application.NavigationHandler
     * 
     * @param {object}
     *            [mNavigationPaths] contains a map of navigationPaths and the respective context
     * 
     * @event navigationPathMatched: a navigation path has been matched, the event contains the following parameters
     *        path {string}: Navigation path back {boolean}: Backwards navigation historyState: {string, number,
     *        object}: associated history state navigationContext {object}: context which has been given when
     *        registering the navigation path defaultMatched: no hash has been given nothingMatched: no navigation path
     *        matched
     */
    var NavigationHandler = sap.ui.base.ManagedObject.extend("sap.ui.ino.application.NavigationHandler", {
        metadata : {
            events : {
                "navigationPathMatched" : {},
                "defaultMatched" : {},
                "nothingMatched" : {}
            }
        },
        constructor : function(mNavigationPaths, bMobile) {
            sap.ui.base.ManagedObject.apply(this);

            if (bMobile) {
                jQuery.sap.require("sap.m.routing.Router");
                this._oRouter = new sap.m.routing.Router();
            } else {
                this._oRouter = new sap.ui.core.routing.Router();
            }
            this._oRouter.attachRouteMatched(this._handleRouteMatch, this);
            this._mNavigationContext = {};

            var that = this;
            jQuery.each(mNavigationPaths || [], function(sNavigationPath, oNavigationContext) {
                that.addNavigationPath(sNavigationPath, oNavigationContext);
            });
        }
    });

    NavigationHandler.Routes = {
        Default : "default",
        Nothing : "nothing"
    };

    /**
     * Returns the hash for a specific navigation path and its state
     * 
     * @param {string}
     *            [sNavigationPath] Navigation path
     * @param {number,
     *            string, Object} [vHistoryState = undefined] State the hash represents
     * @param {boolean}
     *            [bNoEncode=false] whether the history state should be not encoded
     * @return {string} the hash
     */
    NavigationHandler.getHash = function(sNavigationPath, vHistoryState, bNoEncode) {
        var sHistoryState = vHistoryState;
        if (jQuery.isPlainObject(vHistoryState)) {
            sHistoryState = JSON.stringify(vHistoryState);
        }
        if (sHistoryState !== undefined && sHistoryState !== null) {
            return sNavigationPath + "/" + (!bNoEncode ? window.encodeURIComponent(sHistoryState) : sHistoryState);
        } else {
            return sNavigationPath;
        }
    };

    /**
     * Adds a new navigation path
     * 
     * @param {string}
     *            [sNavigationPath] Navigation path (simple string without special character)
     * @param {Object}
     *            [oNavigationContext = undefined] context object which the caller receives when the navigation path is
     *            found. The property mandatoryHistoryState specifies whether the history state is optional or not. When
     *            the history state is optional no other navigation path may start with this navigation path.
     */
    NavigationHandler.prototype.addNavigationPath = function(sNavigationPath, oNavigationContext) {
        if (!sNavigationPath || (sNavigationPath.indexOf("/") !== -1) || sNavigationPath === NavigationHandler.Routes.Default || sNavigationPath === NavigationHandler.Routes.Nothing) {
            jQuery.sap.log.error("Navigation path " + sNavigationPath + " is invalid");
            return;
        }

        // per navigation path we register two routes
        // a) the default route separated by a slash from its context
        // b) a fallback route using the format of jQuery.sap.history required the encoded with %7C
        // (#navigationPath%7Cdata%7C1)
        // the unencoded variant of the fallback route is not possible due to issue with the unescaped | in crossroad.js
        // this case is handled in NavigationHandler.prototype.initialize()

        // Attention: the order of registration is significant!
        var oRoute = {
            name : sNavigationPath + "/legacy",
            pattern : sNavigationPath + "%7C{historyState}%7C1:?query:", // in old format history always needed to be
            // there
            viewLevel : oNavigationContext && oNavigationContext.viewLevel !== undefined ? oNavigationContext.viewLevel : undefined
        };

        this._oRouter.addRoute(oRoute);
        this._mNavigationContext[oRoute.name] = oNavigationContext;

        // Attach the default route last as the optional parameter :historyState: would
        // otherwise also cause this route to match, not detecting the historyState properly
        var bMandatoryHistoryState = oNavigationContext && oNavigationContext.mandatoryHistoryState;
        oRoute = {
            name : sNavigationPath,
            pattern : sNavigationPath + "/" + (bMandatoryHistoryState ? "{historyState}:?query:" : ":historyState::?query:"),
            viewLevel : oNavigationContext && oNavigationContext.viewLevel !== undefined ? oNavigationContext.viewLevel : undefined
        };

        this._oRouter.addRoute(oRoute);
        this._mNavigationContext[oRoute.name] = oNavigationContext;

        return this;
    };

    /**
     * Initializes navigation handling for the registered navigation paths
     */
    NavigationHandler.prototype.initialize = function() {
        // Before initializing we need to handle legacy hashes like #foo|{bar}|1 by redirecting
        // them to #foo/{bar} before finally initializing the router
        var rLegacy = /^\#?([a-z]*)\|(.*)\|1/gi;
        var sHash = window.location.hash;
        if (sHash) {
            var aResult = rLegacy.exec(sHash);
            if (aResult !== null && aResult.length === 3) {
                window.location.hash = "#" + aResult[1] + "/" + aResult[2];
            }
        }
        this._oRouter.initialize();
    };

    /**
     * Attach handler to handle navigation to default route without any hash
     */
    NavigationHandler.prototype.attachDefaultMatched = function(oData, fnFunction, oListener) {
        this.attachEvent("defaultMatched", oData, fnFunction, oListener);
        this._oRouter.addRoute({
            name : NavigationHandler.Routes.Default,
            pattern : ""
        });
        return this;
    };

    /**
     * Attach handler to handle navigation to a not registered navigation path
     */
    NavigationHandler.prototype.attachNothingMatched = function(oData, fnFunction, oListener) {
        this.attachEvent("nothingMatched", oData, fnFunction, oListener);
        // Attention: after this registration no navigation path may be added
        // as this will catch now everything (order of routes is significant!
        this._oRouter.addRoute({
            name : NavigationHandler.Routes.Nothing,
            pattern : ":all*:"
        });
        return this;
    };

    /**
     * Trigger back navigation
     * 
     * @param {Boolean}
     *            [bStayInApplication = false] When back navigation would lead out of the application trigger default
     *            path
     */
    NavigationHandler.prototype.navigateBack = function(bStayInApplication) {
        if (!bStayInApplication) {
            window.history.back();
            return;
        }

        var oHistory = sap.ui.core.routing.History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        // The history contains a previous entry
        if (sPreviousHash !== undefined) {
            window.history.back();
        } else {
            this._oRouter.navTo(null, null, true);
        }
    };

    /**
     * Set browser hash
     * 
     * @see sap.ui.core.routing.HashChanger.prototype.setHash
     */
    NavigationHandler.prototype.setHash = function(sHash) {
        var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
        oHashChanger.setHash(sHash);
    };

    /**
     * Replace browser hash
     * 
     * @see sap.ui.core.routing.HashChanger.prototype.replaceHash
     */
    NavigationHandler.prototype.replaceHash = function(sHash) {
        var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
        oHashChanger.replaceHash(sHash);
    };

    /**
     * Gets current browser hash
     * 
     * @see sap.ui.core.routing.HashChanger.prototype.replaceHash
     */
    NavigationHandler.prototype.getCurrentHash = function() {
        var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
        return oHashChanger.getHash();
    };

    /**
     * returns { path : "{string}", historyState: {object} }
     */
    NavigationHandler.prototype.getCurrentNavigationState = function() {
        return this._currentState || {};
    };

    NavigationHandler.prototype._handleRouteMatch = function(oEvent, oData) {
        jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
        
        var sRouteName = oEvent.getParameter("name");
        var oApplication = sap.ui.ino.application.ApplicationBase.getApplication();
        if (!oApplication.isNavigationEnabled(sRouteName)){
            var oSettings = {
                root : "content"
            };
            var Configuration = sap.ui.ino.application.Configuration;
            var sBootstrapErrorMsg = "GENERAL_APPLICATION_TIT_ERROR_NO_PRIVILEGE";
            var aBootstrapErrorMsgParams = [];
            aBootstrapErrorMsgParams.push("sap.ino.xs.rest.admin.application::execute");
            var oBundle = new sap.ui.model.resource.ResourceModel({
                // resource needs to be hard-coded as the configuration might not have been read
                bundleUrl : Configuration.getBackendRootURL() + "/sap/ino/xs/rest/static/textBundle/" + sap.ui.ino.application.ApplicationBase.RESOURCE_UITEXT + ".properties"
            });
            var sBootstrapErrorMsgText = oBundle.getResourceBundle().getText(sBootstrapErrorMsg, aBootstrapErrorMsgParams);
                    
            var oBootStrapErrorView = sap.ui.view({
                viewName : "sap.ui.ino.views.common.BootstrapError",
                type : sap.ui.core.mvc.ViewType.JS,
                viewData : {
                    errorMessage : sBootstrapErrorMsgText
                }
            });
            oBootStrapErrorView.placeAt(oSettings.root, "only");
            return;
        }
        if (sRouteName === NavigationHandler.Routes.Default) {
            this._currentState = null;
            this.fireDefaultMatched();
            return;
        }
        if (sRouteName === NavigationHandler.Routes.Nothing) {
            this._currentState = null;
            this.fireNothingMatched();
            return;
        }

        var vHistoryState = oEvent.getParameter("arguments").historyState;
        if (vHistoryState !== undefined && vHistoryState !== null) {
            vHistoryState = window.decodeURIComponent(vHistoryState);
            try {
                vHistoryState = JSON.parse(vHistoryState);
            } catch (e) {
                // when it is not a JSON object we use the history state as-is
            }
        } else {
            vHistoryState = undefined;
        }

        var sPath = sRouteName.split("/")[0];
        var oHistory = sap.ui.core.routing.History.getInstance();
        var oDirection = oHistory && oHistory.getDirection();

        this._currentState = {
            path : sPath,
            historyState : vHistoryState
        };
        this.fireNavigationPathMatched({
            back : oDirection === sap.ui.core.routing.HistoryDirection.Backwards,
            path : sPath,
            historyState : vHistoryState,
            context : this._mNavigationContext[sRouteName] || null
        });
    };

    NavigationHandler.prototype._parse = function(sHash) {
        this._oRouter.parse(sHash);
    };

})();
