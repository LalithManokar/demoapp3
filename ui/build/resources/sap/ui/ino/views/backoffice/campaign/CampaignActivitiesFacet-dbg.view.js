/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.models.formatter.DateFormatter");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignActivitiesFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOView, {
	
            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.campaign.CampaignActivitiesFacet";
            },
            
            needsSavedData : function() {
                return true;
            },

            createFacetContent : function(oController) {
                this.oActivityTable = this.createActivityTable();
                oController.bindActivityTable();
                this._oMasterDetailLayout = new sap.ui.layout.VerticalLayout({
                    content : [this.oActivityTable]
                });

                return [new sap.ui.ux3.ThingGroup({
                    title : this.getText("BO_IDEA_ACTIVITIES_TIT_PER_PHASE"),
                    content : this._oMasterDetailLayout,
                    colspan : true
                })];
            },

            createActivityTable : function() {
                var that = this;

                var oActivityTable = new sap.ui.table.Table({
                    enableColumnReordering : false,
                    visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Fixed,
                    visibleRowCount : 10,
                    firstVisibleRow : 0,
                    selectionMode : sap.ui.table.SelectionMode.Single,
                    rowSelectionChange : function(oEvent) {
                        that.getController().onSelectionChanged(
                        		oEvent.getParameter("rowContext"),
                        		oEvent.getParameter("rowIndex")
                        );
                    }
                });
                
                oActivityTable.addColumn(new sap.ui.table.Column({
                    label : new sap.ui.commons.Label({
                        text : this.getText("BO_IDEA_PROCESS_LOG_ROW_DATE")
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "HISTORY_AT",
                            formatter : sap.ui.ino.models.formatter.DateFormatter.formatInfinityWithTime
                        }
                    }),
                    sortProperty : "HISTORY_AT"
                }));

                oActivityTable.addColumn(new sap.ui.table.Column({
                    label : new sap.ui.commons.Label({
                        text : this.getText("BO_IDEA_PROCESS_LOG_ROW_NAME")
                    }),
                    template : new sap.ui.commons.TextView({
                        text : "{HISTORY_ACTOR_NAME}",
                    }),
                    sortProperty : "HISTORY_ACTOR_NAME"
                }));
                
                oActivityTable.addColumn(new sap.ui.table.Column({
                    label : new sap.ui.commons.Label({
                        text : this.getText("BO_IDEA_PROCESS_LOG_ROW_ACTION")
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "HISTORY_BIZ_EVENT",
                            formatter : function(event) {
                                var sStatus = "";
                                if (event) {
                                    if (event.indexOf("STATUS_ACTION_") == 0 && event != "STATUS_ACTION_SUBMIT") {
                                        sStatus = sap.ui.ino.models.core.CodeModel.getText(
                                                "sap.ino.xs.object.status.Action.Root", event.substring(14));
                                    } else {
                                        sStatus = that.getText("BO_EVENT_" + event);
                                    }
                                }
                                return sStatus;
                            },
                        }
                    }),
                    sortProperty : "HISTORY_BIZ_EVENT"
                }));

                return oActivityTable;
            },
            
            getMasterDetailLayout : function(){
            	return this._oMasterDetailLayout;
            },

            getDetailsView : function(){
            	return this._oDetailsView;
            },
            
            setDetailsView : function(oDetailsView){
            	this._oDetailsView = oDetailsView;
            }
        }));