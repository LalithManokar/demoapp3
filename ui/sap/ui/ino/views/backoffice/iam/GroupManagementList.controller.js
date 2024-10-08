/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.iam.GroupManagementList", jQuery.extend({},
        sap.ui.ino.views.common.MasterDetailController, {

            createWriteModel : function() {
                return null;
            },

            getSettings : function() {
                var showColumns =  ["CLIPBOARD", "NAME", "MEMBERS", "DESCRIPTION","IS_MANAGER_PUBLIC"];
                if(sap.ui.ino.application.Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1){
                    showColumns.push('IS_PUBLIC');
                }
                
                var mSettings = {
                    sBindingPathTemplate : "/SearchIdentity(searchToken='{searchTerm}')/Results",
                    aRowSelectionEnabledButtons : ["BUT_EDIT", "BUT_DELETE"],
                    mTableViews : {
                        "default" : {
                            "default" : true,
                            oSorter : new sap.ui.model.Sorter("tolower(NAME)"),
                            aFilters : [new sap.ui.model.Filter("TYPE_CODE", "EQ", 'GROUP')],
                            aVisibleColumns : showColumns,
                            aVisibleActionButtons : ["BUT_NEW_GROUP", "BUT_EDIT", "BUT_DELETE"],
                            sType : "groups"
                        }
                    },
                    sApplicationObject : "sap.ui.ino.models.object.Group"
                };

                return mSettings;
            },

            onDelete : function() {
                var oView = this.getView();
                var oController = this;

                var oSelectedRowContext = oView.getSelectedRowContext();

                sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages();

                function fnDeleteInstance(bResult) {
                    if (bResult) {
                        sap.ui.ino.controls.BusyIndicator.show(0);

                        var oDeleteRequest = sap.ui.ino.models.object.Group.del(oSelectedRowContext
                                .getProperty("ID"));

                        oDeleteRequest.done(function(oResponse) {
                            sap.ui.ino.controls.BusyIndicator.hide();

                            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                            var oMessageParameters = {
                                key : "MSG_GROUP_DELETED",
                                level : sap.ui.core.MessageType.Success,
                                parameters : [],
                                group : "group",
                                text : oMsg.getResourceBundle().getText("MSG_GROUP_DELETED")
                            };

                            var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                            oApp.addNotificationMessage(oMessage);

                        });

                        oDeleteRequest.fail(function(oResponse) {
                            sap.ui.ino.controls.BusyIndicator.hide();
                            if (oResponse.MESSAGES) {
                                for (var i = 0; i < oResponse.MESSAGES.length; i++) {
                                    var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(
                                            oResponse.MESSAGES[i], oView, "group");
                                    sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(
                                            oMessage);
                                }
                            }
                        });
                    }
                }

                var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
                sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_GROUPMGMT_INS_DEL_GROUP"),
                        fnDeleteInstance, i18n.getText("BO_GROUPMGMT_TIT_DEL_GROUP"));
            },
            
            updatePropertyModel : function() {
                var oSelectedRowContext = this.getSelectedRowContext();
                var oView = this.getView();
                if (oSelectedRowContext) {
                    var iId = oSelectedRowContext.getObject().ID;
                    var oPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.iam.Group", iId,
                            {
                                actions : ["update", "del"]
                            });
                    oView.setModel(oPropertyModel, "property");
                } else {
                    oView.setModel(undefined, "property");
                }
            }
            
        }));