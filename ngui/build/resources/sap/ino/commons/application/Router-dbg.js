/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/m/routing/Router",
    "sap/ui/core/routing/History",
    "sap/ui/core/mvc/ViewType"
], function (Router, History, ViewType) {
    "use strict";
    return Router.extend("sap.ino.commons.application.Router", {
        
        //callback function, to be executed before any routing event.
        _fnRoutingCallback : undefined,
        //callback function, to be executed before the browser window/tab is closed.
        _fnCloseCallback : undefined,
        //callback function, to be excuted once before any routing event for title change.
        // _fnTitleChangeCallback : undefined,
        /**
         * Navigates on step back in the history or to "home" if history is empty.
         * 
         * @public
         * @function
         * @name sap.ino.commons.application.Router.onNavBack
         * 
         * @returns {void}
         */
        onNavBack : function(bReplace) {
            var that = this;
            var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var goNavBack = function () {
                if (sPreviousHash !== undefined) {
                    // we would like to have a possibility to remove the source history entry 
                    // (e.g. when it is a create screen) but the API does not offer a possibility
                    window.history.go(-1);
                } else {
                    that.navTo("home", undefined, bReplace);
                }
            };
            
            if(this._fnRoutingCallback){
            	this._fnRoutingCallback(goNavBack);
            } else {
            	goNavBack();
            }
            
        },
        
        /**
         * Navigates two steps back in the history or to "home" if history is empty.
         * 
         * @public
         * @function
         * @name sap.ino.commons.application.Router.onDeleteNavBack
         * 
         * @returns {void}
         */
        onDeleteNavBack : function(sOnDeleteHash, bReplace) {
			var aHistory = History.getInstance() && History.getInstance().aHistory;
			var iHistoryLength = aHistory && aHistory.length;
			if (iHistoryLength > 2 && aHistory[iHistoryLength - 3].indexOf(sOnDeleteHash) > -1) {
			    window.history.go(-2);
            } else if (iHistoryLength > 1 && aHistory[iHistoryLength - 2].indexOf(sOnDeleteHash) > -1) {
                window.history.go(-1);
            } else {
                this.navTo("home", undefined, bReplace);
            }
        },
        
        /**
         * Returns the context (url and parameters) of the current route if busy handling is active.
         * 
         * @public
         * @function
         * @name sap.ino.commons.application.Router.getContext
         * 
         * @returns {string} sContext
         */
        getContext : function() {
            var oHistory = History.getInstance();
            if (typeof oHistory.iHistoryPosition === "number") {
                return oHistory.aHistory[oHistory.iHistoryPosition];
            }
            else {
                return undefined;
            }
        },        
 
        /**
         * Navigate to a given route target.
         * 
         * @param {string} sRoute the name of the route
         * @param {object} oData the query added to the target url
         * @param {boolean} bNoHistory if true the navgation should not be part of the history
         * @param {boolean} bNoBusy if true no busy dialog is shown, even if busy handling is active
         * 
         * @private
         * @function
         * @name sap.ino.commons.application.Router.navTo
         * 
         * @returns {void}
         */
        navTo : function(sRoute, oData, bNoHistory, bNoBusy) {
            var oRouter = this;
            var aArguments = arguments;
            var fnNavigate = function(){
            	Router.prototype.navTo.apply(oRouter, aArguments);
            };
            
            var sContext = this.getContext();
            
            if(this._fnRoutingCallback){
            	this._fnRoutingCallback(fnNavigate, sRoute, sContext);
            } else {
            	fnNavigate();
            }            
        },
        
        /*silentReverse : function() {
            var oHistory = History.getInstance();
            if (oHistory.getDirection() === "Backwards") {
                window.history.go(1);
            } else if (oHistory.getDirection() === "NewEntry") {
                window.history.go(-1);
            } else {
                this.validation = true;
            }
        },*/
        
        
		/**
		 * Will trigger routing events + place targets for routes matching the string
		 * Redefinition of S***UI5 method, to invoke a navigation allowed checker
		 *
		 * @param {string} sNewHash a new hash
		 * @protected
		 */
		parse : function (sNewHash) {
            var oRouter = this;
            var fnNavigate = function(){
            	Router.prototype.parse.apply(oRouter, [sNewHash]);
            };
            
            // if(this._fnTitleChangeCallback){
            //     this._fnTitleChangeCallback();
            // }
            if(this._fnRoutingCallback){
            	this._fnRoutingCallback(fnNavigate);
            }else{
            	fnNavigate();
            }			
		},
        
        /**
         * Sets the routing callback to be executed before any routing.
         * 
         * @public
         * @name sap.ino.commons.application.Router.setRoutingCallback
         * @function
         * 
         * @param {function} fnCallback, the callback function
         * @returns {void}
         */
        setRoutingCallback : function(fnCallback) {
           this._fnRoutingCallback = fnCallback;
        },
        
        /**
         * Sets the close callback to be executed before a browser window/tab is closed.
         * The function also removes the current event handler if set
         * 
         * @public
         * @name sap.ino.commons.application.Router.setCloseCallback
         * @function
         * 
         * @param {function} fnCallback, the callback function
         * @returns {void}
         */
        setCloseCallback : function(fnCallback) {
          //remove current handler
          if(this._fnCloseCallback){
        	 jQuery(window).off('beforeunload', this._fnCloseCallback);
          }
          //set new handler
          this._fnCloseCallback = fnCallback;
          jQuery(window).on('beforeunload', this._fnCloseCallback);
        }
        
        // setTitleChangeCallback : function(fnCallback){
        //     this._fnTitleChangeCallback = fnCallback;
        // }
    });
});