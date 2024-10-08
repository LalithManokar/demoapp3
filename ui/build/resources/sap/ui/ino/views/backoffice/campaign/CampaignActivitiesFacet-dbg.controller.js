/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.campaign.CampaignActivitiesFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOController, {
	
    bindActivityTable : function() {
        var that = this;
        this.getView().oActivityTable.bindRows({
            path : "BusinessEvents",
            sorter : new sap.ui.model.Sorter("HISTORY_AT", true)
        });
    },

    setDetailViewContext : function(oSelectedRowContext) {
        var oDetailsView = this.getView().getDetailsView();
        if (!oDetailsView || oDetailsView.bIsDestroyed) {
            return;
        }
        if (oDetailsView.setRowContext) {
            oDetailsView.setRowContext(oSelectedRowContext);
        } else {
            oDetailsView.setBindingContext(oSelectedRowContext);
        }
    },
    
    onSelectionChanged : function(oSelectedRowContext, iSelectedIndex) {
        if (iSelectedIndex > -1) {
            this.showDetailsView(oSelectedRowContext);
        } else {
            this.hideDetailsView();
        }
    },
    
    createDetailsView : function() {
    	var oDetailsView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignActivitiesDetails");
    	oDetailsView.setFacetView(this);
        return oDetailsView;
    },
    
    hideDetailsView : function() {
    	this.getView().getMasterDetailLayout().addContent(this.getView().getDetailsView());
        this.setDetailViewContext(null);
        this.getView().getMasterDetailLayout().removeContent(this.getView().getDetailsView());
        this.getView().getDetailsView().destroy();
        this.getView().setDetailsView(null);
    },
    
    showDetailsView : function(oSelectedRowContext) {
    	if(!this.getView().getDetailsView() || this.getView().getDetailsView()._bIsBeingDestroyed){
    		this.getView().setDetailsView(this.createDetailsView());
    	}
    	this.setDetailViewContext(oSelectedRowContext);
        this.getView().getMasterDetailLayout().addContent(this.getView().getDetailsView());
    }
}));