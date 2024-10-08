/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.tag.TagList", jQuery.extend({},
        sap.ui.ino.views.common.MasterDetailController, {

            getSettings : function() {

                var mSettings = {
                    sBindingPathTemplate : "/SearchTagsParams(searchToken='{searchTerm}')/Results",
                    aRowSelectionEnabledButtons : ["BUT_EDIT", "BUT_MERGE_CLIPBOARD", "BUT_DELETE"],
                    aVisibleActionButtons : ["BUT_CREATE", "BUT_EDIT", "BUT_MERGE_CLIPBOARD", "BUT_DELETE"],
                    aSelectAllRequiredAttributes :["SEARCH_SCORE","ID","NAME","USAGE_COUNT","CREATED_AT","CREATED_BY_ID","CREATED_BY","CHANGED_AT","CHANGED_BY_ID","CHANGED_BY"],
                    mTableViews : {
                        "default" : {
                            "default" : true,
                            oSorter : new sap.ui.model.Sorter("NAME", false)
                        }
                    },
                    sApplicationObject : "sap.ui.ino.models.object.Tag"
                };

                return mSettings;
            },

            onCreatePressed : function(oEvent) {
                var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagModify");
                oInstanceView.show(-1, "edit");
            },

            onEditPressed : function(oEvent) {
                this._hideDetailsView();
                var oBindingContext = this.getView().getSelectedRowContext();
                if (oBindingContext) {
                    var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagModify");
                    oInstanceView.show(oBindingContext.getProperty("ID"), "edit");
                }
            },

            onMergeWithClipboardPressed : function() {
                var oController = this;
                var oView = this.getView();
                var oBindingContext = oView.getSelectedRowContext();
                if (oBindingContext) {
                    sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("tag");
                    // oView.setBusy(true);
                    var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
                    var aTagKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);
                    var iTagID = oBindingContext.getProperty("ID");
                    var oPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.tag.Tag", iTagID,
                            {
                                actions : [{
                                    "merge" : aTagKeys
                                }]
                            });

                    var oMergeSelectedConfirmationDialog = new sap.ui.commons.Dialog({
                        title : "{i18n>BO_TAG_MODIFY_TIT_MERGE_TAG}",

                    });

                    oMergeSelectedConfirmationDialog.setModel(oPropertyModel, "property");

                    sap.ui.view({
                        viewName : "sap.ui.ino.views.backoffice.tag.MergeConfirmationDialog",
                        type : sap.ui.core.mvc.ViewType.JS,
                        viewData : {
                            action : "merge",
                            parentController : this, // controller
                            fnMerge : function(oParentController) {

                                oController.onMergeWithClipboard(oParentController, aTagKeys, iTagID);

                            }, // function to call the merge
                            confirmationDialog : oMergeSelectedConfirmationDialog,
                            objectName : oBindingContext.getProperty("NAME")
                        }
                    });

                }
            },

            onMergeWithClipboard : function(that, aTagKeys, iTagID) {

                var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
                var oMergeRequest = sap.ui.ino.models.object.Tag.merge(iTagID, aTagKeys);

                oMergeRequest.done(function(oResponse) {
                    var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                    var oMessageParameters = {
                        key : "MSG_TAG_MERGED",
                        level : sap.ui.core.MessageType.Success,
                        parameters : [],
                        group : "tag",
                        text : oMsg.getResourceBundle().getText("MSG_TAG_MERGED")
                    };

                    // remove all keys from the clipboard
                    for (var i = 0; i < aTagKeys.length; i++) {
                        var iID = aTagKeys[i];
                        // remove all tags from the clipboard as they where deleted except the leading one
                        if (iTagID != iID) {
                            oClipboard.remove(sap.ui.ino.models.object.Tag, iID);
                        }
                    }

                    var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                    var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                    oApp.addNotificationMessage(oMessage);
                });

                oMergeRequest.fail(function(oResponse) {
                    if (oResponse.MESSAGES) {
                        for (var i = 0; i < oResponse.MESSAGES.length; i++) {
                            var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(
                                    oResponse.MESSAGES[i], that.getView(), "tag");
                            sap.ui.ino.application.backoffice.Application.getInstance()
                                    .addNotificationMessage(oMessage);
                        }
                    }
                });
            },

            onNavigateToTag : function(oEvent) {
                this._hideDetailsView();
                var oBindingContext = oEvent.getSource().getBindingContext();
                if (oBindingContext) {
                    var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagModify");
                    oInstanceView.show(oBindingContext.getProperty("ID"), "display");
                }
            },

            onDeleteConfirmed : function() {
                var oController = this;
                var oView = this.getView();
                
                var aSelectedRowsContext = oView.getSelectedRowsContext(); 

                sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("tag");
                oView.setBusy(true);
                
                //add Mass Operation to Delete tags
                
                if(aSelectedRowsContext && aSelectedRowsContext.length !== 0){
	                jQuery.each(aSelectedRowsContext, function(iIdx, oSelectedRowContext){
	                	var oDeleteRequest = sap.ui.ino.models.object.Tag.del(oSelectedRowContext.getProperty("ID"));
	
	                    oDeleteRequest.done(function(oResponse) {
	                        oView.setBusy(false);
	
	                        var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
	                        var oMessageParameters = {
	                            key : "MSG_TAG_DELETED",
	                            level : sap.ui.core.MessageType.Success,
	                            parameters : [],
	                            group : "tag",
	                            text : oMsg.getResourceBundle().getText("MSG_TAG_DELETED")
	                        };
	
	                        var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
	                        var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
	                        oApp.addNotificationMessage(oMessage);
	                        oController.clearSelection();
	                        oController._hideDetailsView();
	                    });
	
	                    oDeleteRequest.fail(function(oResponse) {
	                        oView.setBusy(false);
	                        if (oResponse.MESSAGES) {
	                            for (var i = 0; i < oResponse.MESSAGES.length; i++) {
	                                var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(
	                                        oResponse.MESSAGES[i], oView, "tag");
	                                sap.ui.ino.application.backoffice.Application.getInstance()
	                                        .addNotificationMessage(oMessage);
	                            }
	                        }
	                    });
	                });
                }
            },

            onDeletePressed : function() {
                var oView = this.getView();
                var oPropertyModel = oView.getModel("property");
                oView.oDeleteConfirmationDialog.setModel(oPropertyModel, "property");
                oView.oDeleteConfirmationDialog.open();
            },

            clearSelection : function() {
                var oView = this.getView();
                oView._oTable.setSelectedIndex(-1);
            },
            
            updatePropertyModel : function() {
            	var oView = this.getView();
            	var aSelectedIdicx = oView.getTable().getSelectedIndices();
            	var oPropertyModel;
            	
            	if(aSelectedIdicx && aSelectedIdicx.length === 0 ){
            		
            		 oView.setModel(undefined, "property");
            		 
            	}else if (aSelectedIdicx && aSelectedIdicx.length === 1){
            		var oSelectContext = oView.getTable().getContextByIndex(aSelectedIdicx[0]);
            		var iTagId = oSelectContext.getObject().ID;
                    oPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.tag.Tag", iTagId,
                             {
                                 actions : ["update", "del", "merge"]
                             });
                     
                    oView.setModel(oPropertyModel, "property");
            		
            	}else{
            		var oPropertyData = {
            				actions : {
            					del : {
            						enabled : true
            					},
            					merge: {
            						enabled : false
            					},
            					update: {
            						enabled : false
            					}
            				}	
            		};
            		
            		oPropertyModel = new sap.ui.model.json.JSONModel();
            		oPropertyModel.setData(oPropertyData);
            		oView.setModel(oPropertyModel, "property");
            		
            	}
            }
        }));