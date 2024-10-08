/* init libraries */
var _sLibPathPrefix = "/sap/ino/ngui/build/resources/";
jQuery.sap.registerModulePath("sap.ino.controls", _sLibPathPrefix + "sap/ino/controls");
// jQuery.sap.registerModulePath("sap.ino.installation.style",  "/style/");

/* **************************************************************************** */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel /* needs to be required */) {
    "use strict";
    
    return UIComponent.extend("sap.ino.installation.Component",{
        metadata : {
            manifest: "json"
        },
        init: function(){
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);
            // set data model
             var oData = {
                recipient : {
                   name : "installation"
                }
             };
             var oModel = new JSONModel(oData);
             this.setModel(oModel);
    
             // set i18n model
             var i18nModel = new ResourceModel({
                bundleName: "sap.ino.installation.i18n.i18n",
                supportedLocales: [""],
                fallbackLocale: ""
             });
             this.setModel(i18nModel, "i18n");
             // create the views based on the url/hash
			this.getRouter().initialize();
			
			this.getXCSRFTOKEN();	
			
			this.getPreCheck();
			
            },
            getXCSRFTOKEN: function(){
 			    var that = this;
          		var sPingURL = window.location.protocol + '//' + window.location.host + "/sap/ino/xs/rest/common/ping.xsjs";
				var oAjaxPromise = jQuery.ajax({
					url: sPingURL,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					type: "GET",
					contentType: "application/json; charset=UTF-8",
					async: false
				});
				oAjaxPromise.done(function(oResponseBody, sResponseText, oResponse) {
					that._xCSRFToken = oResponse.getResponseHeader("X-CSRF-Token");
				});           
        },
        getPreCheck: function(){
        	var that = this;
        	var oModel = new JSONModel();
            var sURL = window.location.protocol + '//' + window.location.host + "/sap/ino/xs/rest/installation/installationService.xsjs/preCheck";
			var oAjaxPromise = jQuery.ajax({
				url: sURL,
				headers: {
					"X-CSRF-Token": that._xCSRFToken
				},
				data: JSON.stringify({}),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: false
			});
			oAjaxPromise.done(function(oResponseBody) {
			   oModel.setData(oResponseBody);
			   that.setModel(oModel,"preCheck");
			});	            
        }
    }
    );
});