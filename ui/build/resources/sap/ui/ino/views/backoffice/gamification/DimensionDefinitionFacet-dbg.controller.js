/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.commons.MessageBox");

sap.ui.controller("sap.ui.ino.views.backoffice.gamification.DimensionDefinitionFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {
	    onModeSwitch : function(newMode) {
	        var oModel = this.getModel();
			oModel.setProperty("/SELECTED_ACTIVITY_INDEX", -1);
			oModel.setProperty("/SELECTED_BADGE_INDEX", -1);
        },
        
		addAttachment: function(attachmentId, fileName, mediaType) {
			var oView = this.getView();
			var oModel = oView.getController().getModel();
			oModel.addAttachment({
				ATTACHMENT_ID: attachmentId,
				FILE_NAME: fileName,
				MEDIA_TYPE: mediaType
			}, oModel.getProperty("/SELECTED_BADGE_INDEX"));
		},

		removeAttachment: function(attachmentId, fileName, mediaType) {
			var oView = this.getView();
			var oModel = oView.getController().getModel();
			oModel.removeAttachment(attachmentId,  oModel.getProperty("/SELECTED_BADGE_INDEX"));
		},

		createActivity: function(oEvent) {
			var oModel = this.getModel();
			var iHandle = this.getModel().newActivity();
			if (iHandle !== 0) {
				this.setTableDataContextByID("ActivityTable", iHandle, oModel.getProperty("/Activity").length);
				oModel.setProperty("/SELECTED_ACTIVITY_INDEX", oModel.getProperty("/Activity").length - 1);
			}
		},

		delActivity: function(oEvent) {
			var oModel = this.getModel();
			oModel.getProperty("/Activity").splice(oModel.getProperty("/SELECTED_ACTIVITY_INDEX"), 1);
			oModel.setProperty("/SELECTED_ACTIVITY_INDEX", -1);
		},
		
		createBadge: function(oEvent) {
			var oModel = this.getModel();
			var iHandle = this.getModel().newBadge();
			if (iHandle !== 0) {
				this.setTableDataContextByID("BadgeTable", iHandle, oModel.getProperty("/Badge").length);
				oModel.setProperty("/SELECTED_BADGE_INDEX", oModel.getProperty("/Badge").length - 1);
			}
		},

		delBadge: function(oEvent) {
			var oModel = this.getModel();
			oModel.getProperty("/Badge").splice(oModel.getProperty("/SELECTED_BADGE_INDEX"), 1);
			oModel.setProperty("/SELECTED_BADGE_INDEX", -1);
		},

		setTableDataContextByID: function(sId, iId, nCount) {
			var oModel = this.getModel();
			var oTable = sap.ui.getCore().byId(sId);
			for (var i = 0; i < nCount; i++) {
				var oRowContext = oTable.getContextByIndex(i);
				var iID = oModel.getProperty("ID", oRowContext);
				if (iID === iId) {
					oTable.setSelectedIndex(i);
					oTable.setFirstVisibleRow(i);
					return;
				}
			}
		}
	}));