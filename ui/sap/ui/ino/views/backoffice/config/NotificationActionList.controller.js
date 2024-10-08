/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.models.object.NotificationSystemSetting");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.core.mvc.Controller.extend(
    "sap.ui.ino.views.backoffice.config.NotificationActionList", 
    jQuery.extend({}, sap.ui.ino.views.common.MasterDetailController, {
        getSettings: function() {
			var mSettings = {
				mTableViews: {
					"staging": {
						"default": true,
						//sBindingPathTemplate: "/NotificationSystemSetting",
						sBindingPathTemplate: "/SearchNotificationParams(searchToken='{searchTerm}',searchLanguage='{langCode}')/Results",
						mBindingPathParameters: {
						    langCode: sap.ui.ino.application.Configuration.getSystemDefaultLanguage()
						},
						oSorter: new sap.ui.model.Sorter("ACTION_CODE", false),
						aVisibleColumns: ["ACTION_CODE", "ACTION_TYPE_CODE", "ALLOW_EMAIL_NOTIFICATION", "ALLOW_INBOX_NOTIFICATION", "CHANGED_AT", "CHANGED_BY"]
					}
				},
				sApplicationObject: "sap.ui.ino.models.object.NotificationSystemSetting"
			};

			return mSettings;
		},
	    
	    onAfterInit: function() {
	        // hide right tool bar items
// 			setTimeout(function() {
// 				this.getView()._oTable.getToolbar().getRightItems().forEach(function(oItem) {
// 					oItem.setVisible(false);
// 				});
// 			}.bind(this), 0);
	    },
	    
	    hasPendingChanges: function() {
			if (this.oActiveDialog) {
				return this.oActiveDialog.getContent()[0].hasPendingChanges();
			}
			return false;
		},
		
		onNavigateToModel: function(iId, sActionType, bEdit) {
			if (!iId) {
				return;
			}
			this._hideDetailsView();
			var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationAction");
			var sMode = "display";
			if (bEdit === true) {
				sMode = "edit";
			}
			oModifyView.show(iId, sActionType, sMode);
		},
		
		handleEdit: function() {
		    var oSelRowObject = this.getSelectedRowObject();
			this.onNavigateToModel(oSelRowObject.ID, oSelRowObject.ACTION_TYPE_CODE, true);
		},
		
		updatePropertyModel: function() {
		    var oSelContext = this.getSelectedRowContext();
		    this.getView().setModel(
                new sap.ui.model.json.JSONModel({
					actions: {
						update: {
							enabled: !!oSelContext
						}
					}
				}),
				"property"
			);
		  //  var bUpdateEnable = !!oSelContext;
		  //  if (!bUpdateEnable) {
		  //      this.getView().setModel(
    //                 new sap.ui.model.json.JSONModel({
    // 					actions: {
    // 						update: {
    // 							enabled: false
    // 						}
    // 					}
    // 				}),
    // 				"property"
    // 			);
		  //  } else {
		  //      this.getView().setModel(
    //                 new sap.ui.model.json.JSONModel({
    // 					actions: {
    // 						update: {
    // 							enabled: oSelContext.getObject().ACTION_TYPE_CODE !== "STATUS"
    // 						}
    // 					}
    // 				}),
    // 				"property"
    // 			);
		  //  }
		}
}));