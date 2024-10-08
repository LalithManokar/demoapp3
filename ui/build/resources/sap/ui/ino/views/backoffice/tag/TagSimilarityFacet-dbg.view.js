/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");


sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagSimilarityFacet", jQuery.extend({},
        sap.ui.ino.views.common.UsageFacetView, {
            oMergeSelectedButton : null,
            oMergeAllButton : null,
            oSimilarityTable : null,
            oSelectedTag : null,

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.tag.TagSimilarityFacet";
            },

            needsSavedData : function() {
                return true;
            },

            createFacetContent : function() {
                var oController = this.getController();
                oController.initSimilarityModel();
                var oSimilarityGroup = this.createSimilarityThingGroup();

                return [oSimilarityGroup];
            },

            createSimilarityThingGroup : function() {
                var oController = this.getController();
                var aColumns = this.createColumns();

                this.oSimilarityTable = new sap.ui.table.Table({
                    columns : aColumns,
                    navigationMode : sap.ui.table.NavigationMode.Scrollbar,
                    selectionMode : sap.ui.table.SelectionMode.Single,
                    selectionBehavior : sap.ui.table.SelectionBehavior.RowSelector,
                    allowColumnReordering : true,
                    showColumnVisibilityMenu : true,
                    enableColumnFreeze : true,
                    enableCellFilter : true,
                    width : "100%",
                    visibleRowCount: 20,
                    visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto
                });

                var oBindingInformation = this.getTableBindingInformation();
                this.oSimilarityTable.bindRows(oBindingInformation);
                if (this.getThingInspectorController().isInEditMode()) {

                    this.oSimilarityTable.attachRowSelectionChange(oBindingInformation, function(oEvent) {
                        oController.onSelectionChanged(oEvent);
                    });
                    this.oSimilarityTable.setToolbar(this.createSimilarityToolbar());
                }

                var oVerticalLayout = new sap.ui.layout.VerticalLayout({
                    content : [this.oSimilarityTable]
                });

                return new sap.ui.ux3.ThingGroup({
                    title : this.getController().getTextPath("BO_TAG_SIMILARITY_TIT"),
                    content : [oVerticalLayout, new sap.ui.core.HTML({
                        content : "<br/>",
                        sanitizeContent : true
                    })],
                    colspan : true
                });
            },
            
            createSimilarityToolbar : function() {
                var oSimilarityToolbar = new sap.ui.commons.Toolbar();

                this.oMergeSelectedButton = new sap.ui.commons.Button({
                    text : this.getController().getTextPath("BO_TAG_BUT_MERGE_SELECTED"),
                    press : [function(oEvent) {
                        this.getController().onMergeSelectedPressed(oEvent);
                    }, this],
                    enabled : false
                });

                this.oMergeAllButton = new sap.ui.commons.Button({
                    text : this.getController().getTextPath("BO_TAG_BUT_MERGE_ALL"),
                    press : [function(oEvent) {
                        this.getController().onMergeAllPressed(oEvent);
                    }, this],
                    enabled : this.getController().getModel().getProperty(
                            "/property/actions/mergeAllSimilarTags/enabled")
                });

                oSimilarityToolbar.addItem(this.oMergeSelectedButton);
                oSimilarityToolbar.addItem(this.oMergeAllButton);

                return oSimilarityToolbar;
            },

            createColumns : function() {
                // shall return an array of AnalyticalColumn Objects
                return [
                        new sap.ui.table.Column({
                            label : new sap.ui.commons.Label({
                                text : "{i18n>BO_TAG_ROW_DEFAULT_TEXT}"
                            }),
                            template : new sap.ui.commons.Link({
                                text : "{NAME}",
                                press : function(oControlEvent) {
                                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                                    var iObjectID = oRowBindingContext.getProperty("ID");
                                    sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
                                            "tag", {
                                                id : iObjectID,
                                                edit : false
                                            });
                                }
                            }),
                            sortProperty : "NAME"
                        }),
                        new sap.ui.table.Column({
                            label : new sap.ui.commons.Label({
                                text : "{i18n>BO_TAG_ROW_ID}"
                            }),
                            template : new sap.ui.commons.Link({
                                text : "{ID}",
                                press : function(oControlEvent) {
                                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                                    var iObjectID = oRowBindingContext.getProperty("ID");
                                    if(!iObjectID){
                                        return;
                                    }
                                    sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
                                            "tag", {
                                                id : iObjectID,
                                                edit : false
                                            });
                                }
                            }),
                            sortProperty : "ID",
                            visible : false
                        }), new sap.ui.table.Column({
                            label : new sap.ui.commons.Label({
                                text : "{i18n>BO_TAG_ROW_COUNT_TEXT}"
                            }),
                            template : new sap.ui.commons.Label({
                                text : "{USAGE_COUNT}" 
                            }),
                            sortProperty : "USAGE_COUNT"
                        }), new  sap.ui.table.Column({
                            label : new sap.ui.commons.Label({
                                text : "{i18n>BO_TAG_ROW_EDIT_DISTANCE_TEXT}"
                            }),
                            template : new sap.ui.commons.Label({
                                text : "{EDIT_DISTANCE}"
                            }),
                            sortProperty : "EDIT_DISTANCE"
                        })];
            },

            getTableBindingInformation : function() {
                // shall return an object containing the binding info to put into "bindRows"
                // method
                var oRelativeBinding = {
                    path : "SimilarTags"
                };

                return oRelativeBinding;
            },

            revalidateMessages : function() {
                var oThingInspectorView = this.getController().getThingInspectorController().getView();
                oThingInspectorView.revalidateMessages();
            }

        }));