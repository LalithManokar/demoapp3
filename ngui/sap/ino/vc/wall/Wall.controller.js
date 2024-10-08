/*!
 * @copyright@
 */
sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/m/MessageBox",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/Wall",
    "sap/ino/commons/application/WebAnalytics",
    "sap/ino/controls/GenericStyle",
    "sap/ino/wall/util/Helper",
    "sap/ino/vc/wall/util/WallFactory",
    "sap/ino/wall/Wall",
    "sap/ino/wall/WallMode",
    "sap/ino/wall/WallItemHeadline",
    "sap/ino/wall/WallItemLink",
    "sap/ino/wall/WallItemSticker",
    "sap/ino/wall/WallItemImage",
    "sap/ino/wall/WallItemText",
    "sap/ino/wall/WallItemLine",
    "sap/ino/wall/WallItemArrow",
    "sap/ino/wall/WallItemSprite",
    "sap/ino/wall/WallItemPerson",
    "sap/ino/wall/WallItemVideo",
    "sap/ino/wall/WallItemAttachment",
    "sap/ino/wall/WallItemGroup",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/Device",
    "sap/m/MessageToast",
    "sap/ino/wall/ScrollableToolbar"
], function(BaseController, MessageBox, Configuration, WallModel, WebAnalytics, GenericStyle, Helper, WallFactory, Wall, WallMode,
	WallItemHeadline, WallItemLink, WallItemSticker, WallItemImage, WallItemText, WallItemLine, WallItemArrow,
	WallItemSprite, WallItemPerson, WallItemVideo, WallItemAttachment, WallItemGroup, TopLevelPageFacet, Device, MessageToast,
	ScrollableToolbar) {

	// Properties that should be checked for handles
	// Wall Items requires this as a property in content 
	// => currently only attachment/image supported
	var aHandleProperties = ["assignmentId"];

	return BaseController.extend("sap.ino.vc.wall.Wall", jQuery.extend({}, TopLevelPageFacet, {

		routes: ["wall"],

		formatter: {
			image: function(sImageName) {
				return GenericStyle.getImage(sImageName);
			}
		},

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this.setViewProperty("/ToolbarItems", {
				"WallItemHeadline": {
					icon: "wall_headline.png",
					create: function() {
						return new WallItemHeadline({
							title: "{i18n>WALL_ITEMHEADLINE_NEW_TEXT}"
						});
					}
				},
				"WallItemLink": {
					icon: "wall_link.png",
					create: function() {
						return new WallItemLink({
							title: "{i18n>WALL_ITEMLINK_NEW_TEXT}"
						});
					}
				},
				"WallItemSticker": {
					icon: "wall_sticker.png",
					create: function() {
						return new WallItemSticker({
							number: 0,
							title: "{i18n>WALL_ITEMSTICKER_NEW_TEXT}"
						});
					}
				},
				"WallItemImage": {
					icon: "wall_image.png",
					create: function() {
						return new WallItemImage({
							title: "{i18n>WALL_ITEMIMAGE_NEW_TEXT}",
							showAsIcon: false
						});
					}
				},
				"WallItemText": {
					icon: "wall_text.png",
					create: function() {
						return new WallItemText({
							title: "{i18n>WALL_ITEMTEXT_NEW_TEXT}",
							description: ""
						});
					}
				},
				"WallItemLine": {
					icon: "wall_line.png",
					create: function() {
						return new WallItemLine({
							color: Helper.createRandomHexColor()
						});
					}
				},
				"WallItemArrow": {
					icon: "wall_arrow.png",
					create: function() {
						return new WallItemArrow({
							//color : Helper.createRandomHexColor(),
							title: ""
						});
					}
				},
				"WallItemSprite": {
					icon: "wall_sprite.png",
					create: function() {
						var oSprite = new WallItemSprite({
							w: "48px",
							h: "48px",
							color: Helper.createRandomHexColor()
						});
						oSprite.setTitle(WallItemSprite.getNextTitle());
						return oSprite;
					}
				},
				"WallItemPerson": {
					icon: "wall_person.png",
					create: function() {
						return new WallItemPerson({
							title: "{i18n>WALL_ITEMPERSON_NEW_TEXT}"
						});
					}
				},
				"WallItemVideo": {
					icon: "wall_video.png",
					create: function() {
						return new WallItemVideo({
							title: "{i18n>WALL_ITEMVIDEO_NEW_TEXT}"
						});
					}
				},
				"WallItemAttachment": {
					icon: "wall_attachment.png",
					create: function() {
						return new WallItemAttachment({
							title: "{i18n>WALL_ITEMATTACHMENT_NEW_TEXT}"
						});
					}
				},
				"WallItemGroup": {
					icon: "wall_group.png",
					create: function() {
						return new WallItemGroup({
							title: "{i18n>WALL_ITEMGROUP_NEW_TEXT}",
							color: Helper.createRandomHexColor()
						});
					}
				}
			});

			this.setViewProperty("/HIDE_SYS_MSG", true);

			if (!Device.system.desktop) {
				var oSettingsSidePanel = this.getSettingsSidePanel();
				var aSettingsContent = oSettingsSidePanel.getPanel().getContent();
				oSettingsSidePanel.getPanel().removeAllContent();
				oSettingsSidePanel.getPanel().addContent(new ScrollableToolbar(this.createId("scrollableToolbar"), {
					orientation: "Vertical",
					height: "100%",
					width: "100%",
					scrollStep: 250,
					scrollIntoView: false,
					content: aSettingsContent
				}).addStyleClass("sapInoGenericWallScrollableToolbar"));
			}

			var oSystemMessage = this.getOwnerComponent().getRootView().byId("systemMessage");
			if (oSystemMessage) {
				oSystemMessage.setProperty("visible", false);
			}

		},

		onRouteMatched: function(oEvent) {
			this._previouslyFullscreen = this.getFullScreen();
			this.setFullScreen(true);

			var oArgs = oEvent.getParameter("arguments");
			this.iWallId = parseInt(oArgs.id);

			if (this.iWallId > 0) {
				WebAnalytics.logWallView(this.iWallId);
			}

			if (this.getWall()) {
				this.getContentLayout().removeContent(this.getWall());
				this._oWallModel = null;
				this._oWall = null;
			}

			this.getToolbarSidePanel().open();
			this.getSettingsSidePanel().close();

			this.setHelp("WALL");

			this._initWall();
		
		},

		onBeforeHide: function() {
			this.deactivateAutoSync();
		},
        
		onNameChanged: function(oEvent) {
		    if(this.getWall()){
		        this.getWall().setTitle(oEvent.getSource().getValue());  
		    }
		},
        
		onNavigateFrom: function(oEvent) {
			if (!this._previouslyFullscreen) {
				this.setFullScreen(false);
			}
		},

		hasPendingChanges: function() {
		    this.byId("wallTitleInput").fireChange();
			this.clearWall();
			return false;
		},

		onToolbarButtonDrag: function(oEvent) {
			if (Device.system.desktop) {
				var oItem = this.getViewProperty("/ToolbarItems/" + oEvent.getSource().data("item"));
				this.addWallItem(oItem.create());
			}
		},

		onToolbarButtonPress: function(oEvent) {
			if (!Device.system.desktop) {
				this.onToolbarButtonKeyPressed(oEvent);
			}
		},

		onToolbarButtonKeyPressed: function(oEvent) {
			var oItem = this.getViewProperty("/ToolbarItems/" + oEvent.getSource().data("item"));
			this.placeWallItemOnScreen(oItem.create());
		},

		_dropHandling: function(oEvent) {
			oEvent.preventDefault();
		},

		onBeforeRendering: function() {
			jQuery("body").on("dragover drop", this._dropHandling);
		},

		onIdeaCreate: function() {
			this.navigateTo("idea-create", {
				"query": {
					wall: this.getWallModel().getKey()
				}
			});
		},

		refresh: function() {
			this._adjustWall();
			this.getSettings().getController().refresh();
		},

		onWallRefresh: function() {
			this.refreshDeltaWall();
		},

		onZoomLiveChange: function(oEvent) {
			var iZoom = Math.floor(oEvent.getParameter("value"));
			this.getWall().setZoom(iZoom);
			this.getZoomLabel().setText(this.getText("WALL_FLD_ZOOM_TEXT", [iZoom]));
		},

		onWallZoomOut: function(oEvent) {
			var that = this;
			var value = Math.ceil(this.getZoomControl().getValue() / 10) * 10 - 10;
			if (value < 20) {
				value = 20;
			}
			this.getZoomControl().setValue(value);
			this.getWall().setZoom(value);
			this.getZoomLabel().setText(this.getText("WALL_FLD_ZOOM_TEXT", [value]));

		},

		onWallZoomIn: function(oEvent) {
			var that = this;
			var value = Math.floor(this.getZoomControl().getValue() / 10) * 10 + 10;
			if (value > 200) {
				value = 200;
			}
			this.getZoomControl().setValue(value);
			this.getWall().setZoom(value);
			this.getZoomLabel().setText(this.getText("WALL_FLD_ZOOM_TEXT", [value]));
		},

		onWallAdjustViewport: function(oEvent) {
			this.getWall().updateViewport();
			this.getZoomLabel().setText(this.getText("WALL_FLD_ZOOM_TEXT", [this.getWall().getZoom()]));
		},

		onSearch: function(oEvent) {
			var sValue = oEvent.getParameter("query");
			this.search(sValue);
		},

		onSettingsSidePanelChanged: function(oEvent) {
			this.getSettings().getController().getBackgroundSettings().getController().closeColorPicker();
		},

		getContentLayout: function() {
			return this.byId("wallContentLayout");
		},

		getZoomControl: function() {
			return this.byId("wallZoomControl");
		},

		getZoomLabel: function() {
			return this.byId("wallZoomLabel");
		},

		getSearchField: function() {
			return this.byId("wallSearchField");
		},

		getSearchNext: function() {
			return this.byId("wallSearchNext");
		},

		getSearchPrevious: function() {
			return this.byId("wallSearchPrevious");
		},

		getToolbarSidePanel: function() {
			return this.byId("toolbarSidePanel");
		},

		getSettings: function() {
			return this.byId("settings");
		},

		getSettingsSidePanel: function() {
			return this.byId("settingsSidePanel");
		},

		getScrollableToolbar: function() {
			return this.byId("scrollableToolbar");
		},

		clearWall: function() {
			var that = this;
			var oWallModel = that.getWallModel();
			// Before leaving screen: Sync save pending changes in wall and items
			if (this.getWall()) {
				if (!oWallModel._bDeleted) {
					this.saveWallWithAllWallItems();
				}
				// Unbind all events for this wall
				this.getWall().deregisterWallEvents();
			}

			jQuery("body").off("dragover drop", this._dropHandling);
		},

		_initWall: function() {
			var oView = this.getView();
			oView.setBusy(true);

			var oWallModel = new WallModel(this.iWallId);
			this.setObjectModel(oWallModel);
			this._oWallModel = oWallModel;

			var that = this;
			oWallModel.getDataInitializedPromise().done(function(oData) {
				var oWall = WallFactory.createWallFromInoJSON(oData);
				that._oWall = oWall;
				
				// This is required by iPad, so that the touches are recognized after first wall rendering
				if (Device.system.tablet) {
    				var bRebuildWall = false;
    				that._oWall.addDelegate({
    				    onAfterRendering : function() {
    	                    setTimeout(function() {
    	                        if (!bRebuildWall) {
    	                            bRebuildWall = true;
    	                            that._oWall.invalidate();
    	                        }
    	                    }, 1000);
    				    }
    	            });
				}
				that.refresh();
				that.getContentLayout().insertContent(oWall, 0);

				// Handle Write Syncs
				oWall.attachItemAdd(that._handleItemAdd, that);
				oWall.attachItemChange(that._handleItemChange, that);
				oWall.attachItemDelete(that._handleItemDelete, that);
				oWall.attachChange(that._handleChange, that);

				// Handle Read Syncs
				oWall.attachZoomChange(that._handleZoomChange, that);
				oWall.attachSync(that._handleSync, that);
				oWall.attachSyncModeChange(that._handleSyncModeChange, that);

				// make sure the wall zoom is already applied
				setTimeout(function() {
					// set init zoom
					if (that.getZoomLabel()) {
						that.getZoomLabel().setText(that.getText("WALL_FLD_ZOOM_TEXT", [oWall.getZoom()]));
					}
					oView.setBusy(false);
				});
			});
			oWallModel.getDataInitializedPromise().fail(function() {
				oView.setBusy(false);
				MessageBox.show(that.getText("WALL_INS_NOT_EXITS"), MessageBox.Icon.INFORMATION, that.getText("WALL_TIT_NOT_EXITS"), [MessageBox.Action
					.OK], function() {
					that.navigateTo("walllist");
				});
			});
		},

		getWallModel: function() {
			return this._oWallModel;
		},

		getWall: function() {
			return this._oWall;
		},

		/**
		 * Adds an item to the wall
		 *
		 * @param {WallItemBase}
		 *            oItem the item to add to the wall
		 */
		addWallItem: function(oItem) {
			this.getWall().placeItem(oItem);
		},

		/**
		 * Adds an item to the wall
		 *
		 * @param {WallItemBase}
		 *            oItem the item to add to the wall
		 */
		placeWallItemOnScreen: function(oItem) {
			this.getWall().placeItemInCurrentViewPoint(oItem, true);
		},

		_saveWall: function(bProcessSync, bSuppressBackendSync) {
			var that = this;
			var oWall = this.getWall();
			var oWallModel = this.getWallModel();
			var oPromise = oWallModel.save({
				processSync: bProcessSync,
				suppressBackendSync: bSuppressBackendSync
			});
			oPromise.done(function() {
				oWallModel.getDataInitializedPromise().done(function(oData) {
					that.refresh();
				});
			});
			return oPromise;
		},

		_saveItems: function(vWallItems, bSync) {
			var that = this;
			var aItem = [];
			var aWallItem = jQuery.type(vWallItems) === "array" ? vWallItems : [vWallItems];
			aWallItem.forEach(function(oItem) {
				aItem.push(oItem.formatToJSON());
			});
			var oPromise = this._oWallModel.saveItems(aItem);
			oPromise.done(function(oResponse) {
				if (oResponse && oResponse.GENERATED_IDS) {
					aWallItem.forEach(function(oItem) {
						if (oItem.getStorageId() < 0 && oResponse.GENERATED_IDS[oItem.getStorageId()]) {
							oItem.setStorageId(oResponse.GENERATED_IDS[oItem.getStorageId()]);
						}
						if (oItem instanceof WallItemPerson || oItem instanceof WallItemImage || oItem instanceof WallItemAttachment) {
							var oItemJSON = oItem.formatToJSON();
							aHandleProperties.forEach(function(sIdPropertyName) {
								if (oItemJSON.content && oItemJSON.content[sIdPropertyName] && oItemJSON.content[sIdPropertyName] < 0 && oResponse.GENERATED_IDS[
									oItemJSON.content[sIdPropertyName]]) {
									oItem.setProperty(sIdPropertyName, oResponse.GENERATED_IDS[oItemJSON.content[sIdPropertyName]], true);
								}
							});
						}
					});
				}
			});
			oPromise.fail(function(oResponse) {
				that.handleFail(oResponse);
			});
			return oPromise;
		},

		/**
		 * Saves a new wall item in db after the item has been dropped
		 */
		_handleItemAdd: function(oEvent) {
			var aItem = [];

			var oItem = oEvent.getParameter("item");

			function handleItemDeep(oItem) {
				if (oItem.getStorageId() < 0) {
					aItem.push(oItem);
					jQuery.each(oItem.getChilds(), function(index, oChildItem) {
						handleItemDeep(oChildItem);
					});
				}
			}

			handleItemDeep(oItem);

			return this._saveItems(aItem);
		},

		/**
		 * Delete one item
		 */
		_handleItemDelete: function(oEvent) {
			var that = this;
			var aItem = oEvent.getParameter("items");
			var oPromise;

			var aItemDelete = aItem.filter(function(oItem) {
				return oItem.getStorageId() > 0;
			});

			if (aItemDelete.length > 0) {
				var aItemIdDelete = jQuery.map(aItemDelete, function(oItemDelete) {
					return oItemDelete.getStorageId();
				});
				oPromise = this._oWallModel.deleteItems(aItemIdDelete);
				oPromise.fail(function(oResponse) {
					that.handleFail(oResponse);
				});
			}
			return oPromise;
		},

		/**
		 * Takes care of item save in the database after one or more items have been changed
		 */
		_handleItemChange: function(oEvent) {
			var that = this;
			var oItems = oEvent.getParameter("items");
			var aItem = [];
			for (var sKey in oItems) {
				if (oItems.hasOwnProperty(sKey)) {
					var oItem = oItems[sKey];
					if (oItem.getStorageId() > 0) {
						aItem.push(oItem);
					}
				}
			}
			var bSync = oEvent.getParameter("sync") === true;
			var oPromise = this._saveItems(aItem, bSync);
			if (oEvent.getParameter("deferred")) {
				var oDeferred = oEvent.getParameter("deferred");
				oPromise.done(oDeferred.resolve);
				oPromise.fail(oDeferred.reject);
			}
			return oPromise;
		},

		_handleChange: function(oEvent) {
			var that = this;
			var oParams = oEvent.getParameters();
			var bModified = false;
			var oWall = this.getWall();
			var oWallModel = this.getWallModel();

			if (oParams.properties.backgroundColor || oParams.properties.backgroundImage || oParams.properties.backgroundImageZoom || oParams.properties
				.backgroundImageTiled) {
				bModified = true;
				oWallModel.setProperty("/BACKGROUND_COLOR", oWall.getBackgroundColor());
				if (oWallModel.getData().BackgroundImage.length === 0) {
					oWallModel.setProperty("/BACKGROUND_IMAGE_URL", oWall.getBackgroundImage());
				}
				oWallModel.setProperty("/BACKGROUND_IMAGE_ZOOM", oWall.getBackgroundImageZoom());
				oWallModel.setProperty("/BACKGROUND_IMAGE_REPEAT", oWall.getBackgroundImageTiled() ? 1 : 0);
			}

			if (oParams.properties.permissions || oParams.properties.title) {
				bModified = true;
				oWallModel.setProperty("/NAME", oWall.getTitle());
			}

			var oPromise;
			if (bModified) {
				var bSync = oEvent.getParameter("sync") === true;
				oPromise = this._saveWall(bSync, true);
				oPromise.done(function(oMessage) {
					that.refresh();
				});
				oPromise.fail(function(oResponse) {
					that.handleFail(oResponse);
				});
			} else {
				oPromise = jQuery.Deferred().resolve().promise();
			}

			if (oEvent.getParameter("deferred")) {
				var oDeferred = oEvent.getParameter("deferred");
				oPromise.done(oDeferred.resolve);
				oPromise.fail(oDeferred.reject);
			}

			return oPromise;
		},

		_handleZoomChange: function(oEvent) {
			var that = this;
			var iZoom = Math.floor(oEvent.getParameter("zoom"));
			// Do this after the rendering loop
			setTimeout(function() {
				if (that.getZoomControl()) {
					that.getZoomControl().setValue(iZoom);
				}
				if (that.getZoomLabel()) {
					that.getZoomLabel().setText(that.getText("WALL_FLD_ZOOM_TEXT", [iZoom]));
				}
			}, 0);
		},

		/**
		 * Saves the wall with all items (used when the page is left or the user closes the window)
		 */
		saveWallWithAllWallItems: function() {
			var that = this;
			var oPromise = this.getWall().forceSyncFireChange();
			oPromise.done(function(oMessage) {});
			oPromise.fail(function(oResponse) {
				that.handleFail(oResponse);
			});
			return oPromise;
		},

		refreshCompleteWall: function() {
			this.deactivateAutoSync();
			var that = this;
			var oWall = this.getWall();
			var oWallModel = this.getWallModel();
			oWallModel.sync();
			oWallModel.getDataInitializedPromise().done(function(oData) {
				WallFactory.updateWallFromInoJSON(oWall, oData);
				that.refresh();
			});
		},

		refreshDeltaWall: function(bSuppressSave) {
			var that = this;
			if (this._syncPending) {
				return;
			}
			this._syncPending = true;

			var oWallModel = this.getWallModel();

			function sync() {
				var oReadDeltaPromise = oWallModel.readDeltaData();
				oReadDeltaPromise.done(function(oWallData) {
					that.deltaUpdateWall(oWallData);
					that._syncPending = false;
				});
				oReadDeltaPromise.fail(function(oResponse) {
					that._syncPending = false;
					if (oResponse.status == 404) {
						that.deltaUpdateWallDeleted();
					} else {
						that.refreshCompleteWall();
						MessageToast.show(that.getText("WALL_TOOLTIP_WALL_ERROR_NEED_REFRESH"));
					}
				});
			}

			var oPromise;
			if (!bSuppressSave) {
				oPromise = this.saveWallWithAllWallItems();
			}
			if (oPromise) {
				oPromise.done(sync);
				oPromise.fail(function() {
					that._syncPending = false;
				});
			} else {
				sync();
			}
		},

		_handleSync: function(oEvent) {
			this.refreshDeltaWall(true);
		},

		_handleSyncModeChange: function(oEvent) {
			this._wallSyncMode = oEvent.getParameter("value");
			if (!this._wallSyncMode) {
				this.oPollDeltaPromise = null;
				this._syncPending = false;
			} else {
				this._handleSyncMode(true);
			}
		},

		_handleSyncMode: function(bSuppressSave) {
			if (!this._wallSyncMode || this.oPollDeltaPromise || this._syncPending) {
				return;
			}

			this._syncPending = true;
			var that = this;

			var oWallModel = this.getWallModel();

			function sync() {
				that.oPollDeltaPromise = oWallModel.pollDeltaData();
				that.oPollDeltaPromise.done(function(oWallData) {
					if (that._wallSyncMode) {
						that.deltaUpdateWall(oWallData);
					}
					that.oPollDeltaPromise = null;
					that._syncPending = false;
					that._handleSyncMode(bSuppressSave);
				});
				that.oPollDeltaPromise.fail(function(oResponse) {
					that.oPollDeltaPromise = null;
					that._syncPending = false;
					if (oResponse.status == 404) {
						that.deltaUpdateWallDeleted();
					} else {
						that.refreshCompleteWall();
						MessageToast.show(that.getText("WALL_TOOLTIP_WALL_ERROR_NEED_REFRESH"));
						that._handleSyncMode(bSuppressSave);
					}
				});
			}

			var oPromise;
			if (!bSuppressSave) {
				oPromise = this.saveWallWithAllWallItems();
			}
			if (oPromise) {
				oPromise.done(sync);
				oPromise.fail(function() {
					that._syncPending = false;
				});
			} else {
				sync();
			}
		},

		_adjustWall: function() {
			var oWallData = this.getWallModel().getData();
			this.getWall().setMode(oWallData.WALL_EDITABLE ? WallMode.Write : WallMode.Readonly);
			if (oWallData.BackgroundImage && oWallData.BackgroundImage.length > 0) {
				this.getWall().setBackgroundImage(Configuration.getAttachmentDownloadURL(oWallData.BackgroundImage[0].ATTACHMENT_ID));
			}
		},

		deltaUpdateWall: function(oWallData) {
			var that = this;
			var bWallExists = this.getWallModel().deltaUpdate(oWallData, function(oWallJSON) {
				that.getWall().deltaUpdateWallFromJSON(oWallJSON);
			});
			if (bWallExists !== undefined) {
				if (bWallExists) {
					this.refresh();
				} else {
					this.deltaUpdateWallDeleted();
				}
			}
		},

		deltaUpdateWallDeleted: function() {
			var that = this;
			this.deactivateAutoSync();
			MessageBox.show(this.getText("WALL_INS_REFRESH_DELETE"), MessageBox.Icon.INFORMATION, this.getText("WALL_TIT_REFRESH_DELETE"), [
				MessageBox.Action.OK], function() {
				that.navigateTo("walllist");
			});
		},

		handleFail: function(oResponse) {
			var that = this;
			var bWallRefresh = false;
			var bItemRefresh = false;
			jQuery.each(oResponse && oResponse.MESSAGES || [], function(index, oMessage) {
				if (oMessage.REF_OBJECT == "WALL") {
					bWallRefresh = true;
				} else if (oMessage.REF_OBJECT == "WALL_ITEM") {
					if (oMessage.MESSAGE == "MSG_OBJECT_NOT_FOUND" && oMessage.REF_NODE == "Root" && oMessage.REF_ID > 0) {
						var iWallItemId = oMessage.REF_ID;
						var oItem = that.getWall().getItemById(iWallItemId);
						if (oItem) {
							that.getWall().removeItemWithoutRendering(oItem);
							bItemRefresh = true;
						}
					} else {
						bWallRefresh = true;
					}
				}
			});
			if (bWallRefresh) {
				this.refreshCompleteWall();
				MessageToast.show(that.getText("WALL_TOOLTIP_WALL_ERROR_NEED_REFRESH"));
			} else if (bItemRefresh) {
				this.refreshCompleteWall();
				MessageToast.show(that.getText("WALL_TOOLTIP_EDITED_ITEMS_DELETED"));
			}
		},

		deactivateAutoSync: function() {
			this.getSettings().getController().deactivateAutoSync();
		},

		search: function(sValue) {
			if (this._sBeforeSearchValue === sValue) {
				return;
			}
			this._sBeforeSearchValue = sValue;

			var aItems = this.getWall().getItems();
			var bMatched = false;
			var oRegExp;
			var i = 0;
			var aSearchResults = [];

			// Remove trailing spaces
			sValue = jQuery.trim(sValue);
			sValue = sValue.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			oRegExp = new RegExp(sValue, "i");

			// Show all items if query string is empty
			if (sValue.length === 0) {
				this.getWall().toggleEnableItems(true);
				this.resetSearch();
				return;
			}

			// Loop all items and regexp the texts
			for (; i < aItems.length; i++) {
				// Skip line items
				if (aItems[i] instanceof WallItemLine) {
					continue;
				}
				bMatched = false;
				// TODO: Do these checks inside the wall items to cover all possible fields
				if (aItems[i].getTitle && oRegExp.test(aItems[i].getTitle())) {
					bMatched = true;
				}
				if (aItems[i].getDescription && oRegExp.test(aItems[i].getDescription())) {
					bMatched = true;
				}
				if (aItems[i].getImage && oRegExp.test(aItems[i].getImage())) {
					bMatched = true;
				}
				if (aItems[i].getPreview && oRegExp.test(aItems[i].getPreview())) {
					bMatched = true;
				}
				if (aItems[i].getLink && oRegExp.test(aItems[i].getLink())) {
					bMatched = true;
				}
				if (aItems[i].getNumber && oRegExp.test(aItems[i].getNumber())) {
					bMatched = true;
				}
				if (aItems[i].getColor && oRegExp.test(aItems[i].getColor())) {
					bMatched = true;
				}
				if (aItems[i].getURL && oRegExp.test(aItems[i].getURL())) {
					bMatched = true;
				}

				// Show
				if (!bMatched) {
					aItems[i].setEnabled(false);
				} else {
					aSearchResults.push(aItems[i]);
					aItems[i].setEnabled(true);
				}
			}

			this._bCurrentSearchResultsSorted = false;
			this._iCurrentSearchIndex = undefined;
			this._aCurrentSearchResults = aSearchResults;

			// Update previous/next button
			if (this.getSearchPrevious()) {
				this.getSearchPrevious().setEnabled(aSearchResults.length > 0);
			}
			if (this.getSearchNext()) {
				this.getSearchNext().setEnabled(aSearchResults.length > 0);
			}
			if (this.getSearchField()) {
				if (aSearchResults.length > 0) {
					this.getSearchField().addStyleClass("sapInoGenericWallSearchFieldResults");
				} else {
					this.getSearchField().removeStyleClass("sapInoGenericWallSearchFieldResults");
				}
			}
		},

		resetSearch: function() {
			this._bCurrentSearchResultsSorted = false;
			this._iCurrentSearchIndex = 0;
			this._currentSearchResults = [];
			this._sBeforeSearchValue = undefined;
			this.getWall().toggleEnableItems(true);
			if (this.getSearchPrevious()) {
				this.getSearchPrevious().setEnabled(false);
			}
			if (this.getSearchNext()) {
				this.getSearchNext().setEnabled(false);
			}
			if (this.getSearchField()) {
				this.getSearchField().removeStyleClass("sapInoGenericWallSearchFieldResults");
			}
		},

		showPreviousSearchResult: function(oEvent) {
			if (!this._aCurrentSearchResults || this._aCurrentSearchResults.length === 0) {
				return;
			}

			// let the wall calculate the order of the search results
			if (!this._bCurrentSearchResultsSorted) {
				this._aCurrentSearchResults = this.getWall().getItemsByPosition(this._aCurrentSearchResults);
				this._bCurrentSearchResultsSorted = true;
			}

			// calculate new index
			if (this._iCurrentSearchIndex !== undefined) {
				this._iCurrentSearchIndex -= 1;
			} else {
				// start with last item
				this._iCurrentSearchIndex = this._aCurrentSearchResults.length - 1;
			}

			if (this._iCurrentSearchIndex < 0) {
				this._iCurrentSearchIndex = this._aCurrentSearchResults.length - 1;
			}

			// show result item
			this.getWall().showItems([this._aCurrentSearchResults[this._iCurrentSearchIndex]]);
		},

		showNextSearchResult: function(oEvent) {
			if (!this._aCurrentSearchResults || this._aCurrentSearchResults.length === 0) {
				return;
			}

			// let the wall calculate the order of the search results
			if (!this._bCurrentSearchResultsSorted) {
				this._aCurrentSearchResults = this.getWall().getItemsByPosition(this._aCurrentSearchResults);
				this._bCurrentSearchResultsSorted = true;
			}

			// calculate new index
			if (this._iCurrentSearchIndex !== undefined) {
				this._iCurrentSearchIndex += 1;
			} else {
				// start with first item
				this._iCurrentSearchIndex = 0;
			}

			if (this._iCurrentSearchIndex > this._aCurrentSearchResults.length - 1) {
				this._iCurrentSearchIndex = 0;
			}

			// show result item
			this.getWall().showItems([this._aCurrentSearchResults[this._iCurrentSearchIndex]]);
		},

		openHelpScreen: function(oEvent) {
			this.getOwnerComponent().getRootController().openHelpScreen();
		}
	}));
});