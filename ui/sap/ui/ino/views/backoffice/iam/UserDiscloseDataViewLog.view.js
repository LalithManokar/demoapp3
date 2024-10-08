/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserDiscloseDataViewLog", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOView, {
	
            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.iam.UserDiscloseDataViewLog";
            },
            createFacetContent : function(oController) {
                this.oViewLogTable = this.createViewLogTable();
                oController.bindViewLogTable();
                this._oMasterDetailLayout = new sap.ui.layout.VerticalLayout({
                    content : [this.oViewLogTable]
                });

                return [new sap.ui.ux3.ThingGroup({
                    title : this.getText("BO_IDEA_ACTIVITIES_TIT_PER_PHASE"),
                    content : this._oMasterDetailLayout,
                    colspan : true
                })];
            },

            createViewLogTable : function() {
                var oViewLogTable = new sap.ui.table.Table({
                    //navigationMode : sap.ui.table.NavigationMode.Scrollbar,
                    enableColumnReordering : false,
                    visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Fixed,
                    visibleRowCount : 10,
                    firstVisibleRow : 0,
                    selectionMode : sap.ui.table.SelectionMode.Single
                });
                
                oViewLogTable.addColumn(new sap.ui.table.Column({
                    label : new sap.ui.commons.Label({
                        text : this.getText("BO_IDENT_VIEW_LOG_DISCLOSED_ON")
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            //path : this.getFormatterPath("DISCLOSED_AT"),
                            path:"DISCLOSED_AT",
                            type: new sap.ui.model.type.Date()
                        }
                    }),
                    sortProperty : "DISCLOSED_AT"
                }));

                oViewLogTable.addColumn(new sap.ui.table.Column({
                    label : new sap.ui.commons.Label({
                        text : this.getText("BO_IDENT_VIEW_LOG_DISCLOSED_BY")
                    }),
					template: new sap.ui.commons.Link({
					    
						text:{ path:"DISCLOSED_BY_NAME"
						}, 
						press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("DISCLOSED_BY_ID", "user")
					}),                    
                    sortProperty : "DISCLOSED_BY_ID"
                }));
                

                return oViewLogTable;
            }


        }));