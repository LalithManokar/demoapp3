sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ino/commons/application/Configuration",
    "sap/ino/wall/Wall",
    "sap/ino/vc/wall/util/WallFactory"
], function(BaseController, Device, Configuration, Wall, WallFactory) {
	"use strict";
	/**
	 * @class
	 * Mixin that handles actions for Comment and Internal Note
	 */
	var WallMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	WallMixin._wallMixinInit = function(oSetting) {
		this._wallMixinSetting = oSetting;

	};

	WallMixin.onWallAdd = function() {
		this._getWallPickerDialog().open();

		var oWallPickerView = this._getWallPickerView();
		if (oWallPickerView) {
			var bVariantChanged = oWallPickerView.getController().setDefaultVariant();
			if (bVariantChanged) {
				oWallPickerView.invalidate();
			}
		}
		this.setViewProperty("/Picker/VARIANT", oWallPickerView.getController().getViewProperty("/List/VARIANT"));
	};

	WallMixin.onWallRemove = function(oEvent) {
		var oWallControl = oEvent.getSource().getWallControl();
		var oObject = this.getModel("object");
		this._wallMixinSetting.wallRemoveAction(oObject, oWallControl);
	};

	WallMixin._bindList = function() {
		this.setPath(this._wallMixinSetting.wallBindPath);
		BaseController.prototype.bindList.apply(this, arguments);
	};

	WallMixin.onItemPress = function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("object");
		if (oContext && oContext.getProperty("WALL_ID")) {
			// navigate to selected wall
			this.navigateToWall("wall", {
				id: oContext.getProperty("WALL_ID")
			});
		}
	};

	WallMixin.onWallPickerCancel = function() {
		this._getWallPickerDialog().close();
	};

	WallMixin._getWallPickerDialog = function() {
		if (!this._oWallPickerDialog) {
			this._oWallPickerDialog = this.createFragment("sap.ino.vc.wall.fragments.WallPickerDialog", this.createId("wallpicker"));
		}

		this.getView().addDependent(this._oWallPickerDialog);
		var oWallPickerView = this._oWallPickerDialog.getContent() && this._oWallPickerDialog.getContent()[0];
		if (oWallPickerView) {
			oWallPickerView.getController().delegates.SYNC_VIEW_CONTROLLER = this;
			if (!Device.system.phone) {
				oWallPickerView.addStyleClass("sapUiSmallMargin");
			}
		}
		return this._oWallPickerDialog;
	};

	WallMixin._getWallPickerView = function() {
		return this._getWallPickerDialog().getContent() && this._getWallPickerDialog().getContent()[0];
	};

	WallMixin.getList = function() {

		return this.byId(this._wallMixinSetting.wallId);
	};

	WallMixin._mapWallAssignmentToWallData = function(oWallAssignment) {
		var oWallData = jQuery.extend(true, {}, oWallAssignment); // deep clone
		oWallData.ID = oWallAssignment.WALL_ID;
		return oWallData;
	};

	WallMixin._getWallPreview = function(oWallListItem) {
		return oWallListItem &&
			oWallListItem.getAggregation("content") &&
			oWallListItem.getAggregation("content")[1];
	};

	WallMixin._updateWallPreviewControls = function() {
		var that = this;
		var aListItems = this.getList().getItems();
		var aData = this._wallMixinSetting.wallData(this.getModel("object"));

		aListItems.forEach(function(oItem) {
			var oWallPreview = that._getWallPreview(oItem);
			var iId = oWallPreview && oWallPreview.getBindingContext("object").getProperty("WALL_ID");
			var aWallData = aData.filter(function(oData) {
				return oData.WALL_ID === iId;
			});

			if (aWallData && aWallData.length > 0) {
				var oWallAssignment = aWallData[0];
				var oWallData = that._mapWallAssignmentToWallData(oWallAssignment);
				var oWall = WallFactory.createWallFromInoJSON(oWallData);

				if (oWallData.BACKGROUND_IMAGE_ATTACHMENT_ID) {
					oWall.setBackgroundImage(Configuration.getAttachmentDownloadURL(oWallData.BACKGROUND_IMAGE_ATTACHMENT_ID));
				}

				var aItemJSON = WallFactory.createWallItemsFromInoJSON(oWallData.Items);
				var aItems = [];

				aItemJSON.forEach(function(oData) {
					aItems.push(Wall.createWallItemFromJSON(oData));
				});
				if (aItems && aItems.length > 0) {
					var iLength = aItems.length;
					for (var ii = 0; ii < iLength; ii++) {
						oWall.addItemWithoutRendering(aItems[ii]);
					}
					oWallPreview.setNumberOfItems(iLength);
				}

				oWallPreview.setWall(oWall);
				oWallPreview.invalidate();
			}
		});
	};
	WallMixin.getItemTemplate = function() {
		return this.getFragment("sap.ino.vc.wall.fragments.WallListItemInIdea");
	};

	return WallMixin;
});