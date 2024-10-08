/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.iam.UserDiscloseDataViewLog", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOController, {
	
    bindViewLogTable : function() {
        this.getView().oViewLogTable.bindRows({
           path :"UserDiscloseDataViewLog",
           sorter : new sap.ui.model.Sorter("DISCLOSED_AT", true)
        });
        
    }
}));