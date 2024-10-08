/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementList", jQuery.extend({},
        sap.ui.ino.views.common.MasterDetailView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.iam.GroupManagementList";
            },

            createColumns : function(oTable) {
                var oController = this.getController();

                var oClipboard = sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumn(this.createId("CLIPBOARD"), sap.ui.ino.models.object.Group);
                               
                var oLink = sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
                    id : this.createId("NAME"),
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_USERMANAGEMENT_LIST_ROW_NAME}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : "{NAME}",
                        press : function(oControlEvent) {
                            var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                                var oGroupInstanceView = sap.ui
                                        .jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance");
                                oGroupInstanceView
                                        .show(oRowBindingContext.getProperty("ID"), "display");
                        }
                    }),
                    sortProperty : "NAME",
                    filterProperty : "NAME"
                }));
                
                var aColumns = [
                 oClipboard,
                 oLink,
                 new sap.ui.table.Column({
                    id : this.createId("MEMBERS"),
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_USERMANAGEMENT_LIST_ROW_MEMBERS}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : "{MEMBERS}"
                    }),
                    sortProperty : "MEMBERS",
                    filterProperty : "MEMBERS",
                    filterType : new sap.ui.model.type.Integer()
                 }), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
                    id : this.createId("DESCRIPTION"),
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_USERMANAGEMENT_LIST_ROW_DESCRIPTION}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : "{DESCRIPTION}"
                    }),
                    sortProperty : "DESCRIPTION",
                    filterProperty : "DESCRIPTION"
                })),new sap.ui.table.Column({
                    id : this.createId("IS_MANAGER_PUBLIC"),
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_GROUPMGMT_GROUP_ROW_IS_MANAGER_PUBLIC}"
                    }),
                    template : new sap.ui.commons.CheckBox({
                        editable : false,
                        checked : {
                            path : "IS_MANAGER_PUBLIC",
                            type : new sap.ui.ino.models.types.IntBooleanType()
                        }
                    }),
                    sortProperty : "IS_MANAGER_PUBLIC",
                    filterProperty : "IS_MANAGER_PUBLIC"
                 }),new sap.ui.table.Column({
                    id : this.createId("IS_PUBLIC"),
                    visible: sap.ui.ino.application.Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1 > 0,
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_USERMANAGEMENT_LIST_ROW_PUBLIC}"
                    }),
                    template : new sap.ui.commons.CheckBox({
                        editable : false,
                        checked : {
                            path : "IS_PUBLIC",
                            type : new sap.ui.ino.models.types.IntBooleanType()
                        }
                    }),
                    sortProperty : "IS_PUBLIC",
                    filterProperty : "IS_PUBLIC"
                 })];
                return aColumns;
            },

            createActionButtons : function() {
                var oView = this;
                var oController = this.getController();

                this.oNewGroupButton = new sap.ui.commons.Button({
                    id : this.createId("BUT_NEW_GROUP"),
                    press : function() {
                        sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance").show(-1, "edit");
                    },
                    text : "{i18n>BO_IDENT_BUT_NEW_GROUP}",
                    lite : false
                });

                this.oEditButton = new sap.ui.commons.Button({
                    id : this.createId("BUT_EDIT"),
                    press : function() {
                        if (oView.getSelectedRowContext()) {
                            var oGroupInstanceView = sap.ui
                                        .jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance");
                            oGroupInstanceView.show(oView.getSelectedRowContext().getProperty("ID"), "edit");
                        }
                    },
                    text : "{i18n>BO_IDENT_BUT_EDIT}",
                    lite : false,
                    enabled : "{property>/actions/update/enabled}"
                });

                this.oDeleteButton = new sap.ui.commons.Button({
                    id : this.createId("BUT_DELETE"),
                    press : function() {
                        oController.onDelete();
                    },
                    text : "{i18n>BO_IDENT_BUT_DELETE}",
                    lite : false,
                    enabled : "{property>/actions/del/enabled}"
                });

                return [this.oNewGroupButton, this.oEditButton, this.oDeleteButton];

            },

            createDetailsView : function() {
                this._oDetailsView = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementListDetails");
                return this._oDetailsView;
            },
}));