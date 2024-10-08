/*!
 * @copyright@
 */
sap.ui.define([], function() {
    "use strict";

    return {
        _getText: function (sText, aParameters) {
            return this.i18n.getResourceBundle().getText(sText, aParameters);
        },
        
        /**
         * Generates the body of a mail that has been created on the UI
         * 
         * @param oContextObjectModel
         *            object model that is currently set for the view
         */
        createContent : function(oContextObjectModel) {
            if(oContextObjectModel) {
                var sSubject = "";
                var sContextObjectName = oContextObjectModel.getProperty("/NAME");
                var sContextObjectType = oContextObjectModel.getProperty("/_OBJECT_TYPE_CODE");
                if(sContextObjectType === "IDEA") {
                    sSubject = this._getText("MAIL_SUBJECT_TEMPLATE", [oContextObjectModel.getProperty("/CAMPAIGN_NAME"), sContextObjectName]);
                } else {
                    sSubject = sContextObjectName;
                } 
    
                var sBody = "";
                var iContextObjectId = oContextObjectModel.getProperty("/ID");
                if(sContextObjectType && iContextObjectId) {
                    var sURL = document.location.origin +
                                document.location.pathname + 
                                this.getNavigationLink(sContextObjectType.toLowerCase() + "-display", {id : iContextObjectId});
                    sBody = this.getText("MAIL_TEMPLATE_" + sContextObjectType, sURL);
                }
                return {
                    subject: sSubject,
                    body: sBody
                };
            }
        }
    };
});