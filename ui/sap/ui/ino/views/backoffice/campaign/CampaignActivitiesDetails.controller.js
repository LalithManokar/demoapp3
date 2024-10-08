/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignActivitiesDetails", {

    createMailBody : function(sType, iId) {
        var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
        var sURL = oApp.getEncodedNavigationLink('sap.ino.config.URL_PATH_UI_FRONTOFFICE', sType, iId);
        var sBody = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("GENERAL_MSG_MAIL_TEMPLATE_CAMPAIGN", [sURL]);
        return sBody;
    },
    
    sendMail : function(aRecipients) {
    	var oView = this.getView();

        var oMailObject = sap.ui.ino.application.ControlFactory.createMailObject();
        
        var iId = oView.getBindingContext().getObject().CAMPAIGN_ID;
        var sMailBody = this.createMailBody("campaign", iId);
        
        oMailObject.executeMailTo(aRecipients, sMailBody);
    }
});