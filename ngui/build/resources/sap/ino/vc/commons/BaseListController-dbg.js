sap.ui.define([
    "./BaseBlockController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/formatters/BaseListFormatter",
    "sap/ino/controls/OrientationType",
    "sap/ui/core/ResizeHandler",
    "./mixins/IdentityQuickviewMixin",
    "./mixins/ClipboardMixin",
    "./mixins/IdentityCardSendMailMixin",
    "sap/ino/commons/application/Configuration"
], function(BaseController,
	Device,
	JSONModel,
	BaseListFormatter,
	OrientationType,
	ResizeHandler,
	IdentityQuickviewMixin,
	ClipboardMixin,
	IdentityCardSendMailMixin,
	Configuration) {
	"use strict";

	/**
	 * @mixes IdentityQuickViewMixin
	 */
	return BaseController.extend("sap.ino.vc.commons.BaseListController", jQuery.extend({}, IdentityQuickviewMixin, ClipboardMixin,
		IdentityCardSendMailMixin, {

			formatter: BaseListFormatter,

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);

				this._oListConfigModel = new JSONModel(this.list || {});
				this.getView().setModel(this._oListConfigModel, "list");

				this._oFilterBar = this.byId("filterBar");
				// remove pullToRefresh on Desktops
				if (Device.system.desktop) {
					var oPull = this.byId("pullToRefresh");
					if (oPull) {
						var oParent = oPull.getParent();
						oParent.removeContent(oPull);
					}
				}
				this._sResizeRegId = this.attachListControlResized(this.getList());
				this.setFullScreen(Configuration.getPersonalize().SCREEN_SIZE);
			},

			onExit: function() {
				this.detachListControlResized(this._sResizeRegId);
			},

			//TODO move to basecontroller

			/* *************** ORIENTATION HANDLING *************** */

			// attached to orientation of device
			_onBaseOrientationChange: function(oEvent) {
				this._onOrientationHandler();
			},

			_onOrientationHandler: function(eOrientation) {
				this.bindList();
			},

			// can be overwritten
			onOrientationChange: function(eOrientation) {
				if (eOrientation === OrientationType.LANDSCAPE) {
					if (this.getPortraitStyle) {
						this.getList().removeStyleClass(this.getPortraitStyle());
					}
					if (this.getLandscapeStyle) {
						this.getList().addStyleClass(this.getLandscapeStyle());
					}
				} else {
					if (this.getPortraitStyle) {
						this.getList().addStyleClass(this.getPortraitStyle());
					}
					if (this.getLandscapeStyle) {
						this.getList().removeStyleClass(this.getLandscapeStyle());
					}
				}

				this.getList().setWrapping(eOrientation !== OrientationType.LANDSCAPE);

			},

			// manual change via button
			_onManualOrientationChange: function() {
				var iOrientation = this.getViewProperty("/ORIENTATION");
				iOrientation = (iOrientation === OrientationType.PORTRAIT ? OrientationType.LANDSCAPE : OrientationType.PORTRAIT);
				this.setViewProperty("/ORIENTATION", iOrientation);

				this._onOrientationHandler(iOrientation);
				this.onOrientationChange(iOrientation);
			},

			/* ****************************** */

			//TODO: this does not work for overflow buttons => see CSN 1670307807

			// focus during updates in managed lists
			onObjectListUpdateStarted: function(oEvent) {
				var iControlId = sap.ui.getCore().getCurrentFocusedControlId();
				// if we are some where within the list the focus lies one a __clone id
				if (iControlId && iControlId.indexOf("__clone") > -1) {
					// as the list item is probably replacedby a new clone, we need to know the list index
					//todo use indexOfItem
					var list = oEvent.getSource(),
						iIdx;
					if (list && list.getItems) {
						iIdx = list.getItems().map(function(e) {
							return e.getId().substring(e.getId().lastIndexOf("__clone"));
						}).indexOf(iControlId.substring(iControlId.lastIndexOf("__clone")));
						this._iBeforeUpdateControlIdx = iIdx;
						this._iBeforeUpdateControlId = iControlId.substring(0, iControlId.lastIndexOf("__clone"));
					}
				}
			},

			onObjectListUpdateFinished: function(oEvent) {
				// do not change focus if available
				if (!sap.ui.getCore().getCurrentFocusedControlId() && this._iBeforeUpdateControlIdx > -1) {
					//todo get all items???
					var aItems = this.getList().getItems();
					if (aItems && aItems.length > this._iBeforeUpdateControlIdx) {
						var oItem = aItems[this._iBeforeUpdateControlIdx];
						var sClone = oItem.getId().substring(oItem.getId().lastIndexOf("__clone"));

						var sControlId = this._iBeforeUpdateControlId + sClone;
						var oControl = sap.ui.getCore().getElementById(sControlId);
						if (oControl) {
							oControl.focus();
						}
					}
				}
				//         var oVariant = this.getModel("view").getData().List.VARIANT;
				//         var oCount = this.getModel("data");
				//           for (var i = 0; i < this.getModel("list").getData().Variants.Values.length; i += 1) {
				//             if(this.getModel("list").getData().Variants.Values[i].ACTION === oVariant){
				// 	this.getModel("list").setProperty("/Variants/Values/" + i + "/COUNT",1);
				// 	break;
				//                   }
				// }
				//this.bindlist();
				this._iBeforeUpdateControlId = undefined;
				this._iBeforeUpdateControlIdx = undefined;
			},

			onObjectListGrowFinished: function(oEvent) {
				// update the check box state after lazy load
				// this event will be fired before "UpdateFinished"
				if (oEvent.getParameter("actual") > 30) {
					var aNewItems = this.getList().getItems().slice(oEvent.getParameter("actual") - 30);
					this.onMassIdeaSelect(aNewItems, this.getViewProperty("/List/SELECT_ALL"), true);
				}
			},

			/* ****************************** */

			/**
			 * @deprecated
			 */
			_onResize: function(oEvent) {
				var that = oEvent.control;
				var iWidth = oEvent.size.width;
				var iOldWidth = oEvent.oldsize ? oEvent.oldsize.width : -1;

				if (iWidth !== iOldWidth) {
					that.removeStyleClass("sapInoListWidthXXXS");
					that.removeStyleClass("sapInoListWidthXXS");
					that.removeStyleClass("sapInoListWidthXS");
					that.removeStyleClass("sapInoListWidthS");
					that.removeStyleClass("sapInoListWidthM");
					that.removeStyleClass("sapInoListWidthL");
					that.removeStyleClass("sapInoListWidthXL");
					that.removeStyleClass("sapInoListWidthXXL");
					that.removeStyleClass("sapInoListWidthXXXL");
					that.removeStyleClass("sapInoListWidthXXXXL");

					if (iWidth < 500) {
						that.addStyleClass("sapInoListWidthXXXS");
					} else if (iWidth < 600) {
						that.addStyleClass("sapInoListWidthXXS");
					} else if (iWidth < 700) {
						that.addStyleClass("sapInoListWidthXS");
					} else if (iWidth < 800) {
						that.addStyleClass("sapInoListWidthS");
					} else if (iWidth < 900) {
						that.addStyleClass("sapInoListWidthM");
					} else if (iWidth < 1000) {
						that.addStyleClass("sapInoListWidthL");
					} else if (iWidth < 1100) {
						that.addStyleClass("sapInoListWidthXL");
					} else if (iWidth < 1200) {
						that.addStyleClass("sapInoListWidthXXL");
					} else if (iWidth < 1300) {
						that.addStyleClass("sapInoListWidthXXXL");
					} else {
						that.addStyleClass("sapInoListWidthXXXXL");
					}
				}
			},

			_updateListAccessibility: function() {
				// accessibility: we need to update the aria property like this due to (for us) not usable behaviour of UI5
				var oList = this.getList();

				oList.$().find(".sapMListUl").attr("role", "list");

				var aItems = oList.$().find("li");
				jQuery.each(aItems, function(iIdx, oItemDom) {
					var $Item = jQuery(oItemDom);
					$Item.attr("role", "group");
					var $Label = $Item.find(".sapInoItemAriaLabel");
					if ($Label && $Label.length > 0) {
						$Item.attr("aria-labelledby", $Label[0].id);
					}
					var $Content = $Item.find(".sapMLIBContent");
					if ($Content && $Content.length > 0) {
						$Content.attr("role", "listitem");
					}
				});
			},

			getScrollContainer: function() {
				return this._oScrollContainer;
			},

			getFilterBar: function() {
				return this._oFilterBar;
			},

			getListLayout: function() {
				return this.byId("objectListLayout");
			},
			getFilterButton: function() {
				return this.byId("filterButton");
			},
			getFilterPanel: function() {
				return this.byId("filterPanel");
			},

			getFilterDialog: function() {
				return this.byId("filterDialog");
			},

			getSortPanel: function() {
				return this.byId('sortPanel');
			},
			isFilterVisible: function() {
				var oFilterPanel = this.getFilterPanel();
				if (oFilterPanel) {
					return oFilterPanel.hasStyleClass("sapInoFilterSidePanelVisible");
				} else {
					return false;
				}
			},

			onShowFilterBar: function(oEvent) {
				this.showFilterBar(true);
				if (this.getModel("filterItemModel")) {
					this.getModel("filterItemModel").setProperty("/isShowFilterSideFilterButtonGroup", oEvent.getSource().getPressed && oEvent.getSource()
						.getPressed());
				}
			},

			showFilterBar: function(bShow) {
				if (!Device.system.desktop) {
					var oFilterDialog = this.getFilterDialog();
					if (oFilterDialog.isOpen() && !bShow) {
						oFilterDialog.close();
					} else if (!oFilterDialog.isOpen() && bShow) {
						oFilterDialog.open();
						if (this.onSetFilterBarVisible) {
							this.onSetFilterBarVisible();
						}
					}
				} else {
					var oObjectListLayout = this.getListLayout();
					var oFilterPanel = this.getFilterPanel();
					var oSortPanel = this.getSortPanel();
					if (!oObjectListLayout || !oFilterPanel) {
						return;
					}

					if (this.isFilterVisible() || bShow === false) {
						oObjectListLayout.removeStyleClass("sapInoObjectListLayoutFit");
						oFilterPanel.removeStyleClass("sapInoFilterSidePanelVisible");
						if (oSortPanel) {
							oObjectListLayout.removeStyleClass('sapInoObjectListLayoutTop');
							oSortPanel.removeStyleClass("sapInoSortPanelLayoutFit");
						}
					} else {
						oObjectListLayout.addStyleClass("sapInoObjectListLayoutFit");
						oFilterPanel.addStyleClass("sapInoFilterSidePanelVisible");
						if (oSortPanel) {
							oObjectListLayout.addStyleClass('sapInoObjectListLayoutTop');
							oSortPanel.addStyleClass("sapInoSortPanelLayoutFit");
						}
						if (this.onSetFilterBarVisible) {
							this.onSetFilterBarVisible();
						}
					}
				}
			},

			onApplyFilter: function() {
				var oFilterDialog = this.getFilterDialog();
				if (JSON.stringify(this.getViewModelBackup()) === JSON.stringify(this.getViewProperty("/")) && JSON.stringify(this.getFilterItemModelBackup()) ===
					JSON.stringify(this.getModel("filterItemModel"))) {
					oFilterDialog.close();
					return;
				}

				var oQuery = this.getQuery();

				this.navigateIntern(oQuery, true);

				oFilterDialog.close();
			},

			onCancelFilter: function() {
				var oFilterDialog = this.getFilterDialog();
				//             var ModelBackup = this.ViewModelBackup || this.getListController().ViewModelBackup;

				//             this.setViewProperty("/List/SORT", ModelBackup.List.SORT);
				// 			this.setViewProperty("/List/ORDER", ModelBackup.List.ORDER);
				// 			this.setViewProperty("/List/SEARCH", ModelBackup.List.SEARCH);
				// 			this.setViewProperty("/List/TAGS",  ModelBackup.List.TAGS);
				// 			this.setViewProperty("/List/VARIANT", ModelBackup.List.VARIANT);

				this.setViewProperty("/List/SORT", this.ViewModelBackup.List.SORT);
				this.setViewProperty("/List/ORDER", this.ViewModelBackup.List.ORDER);
				this.setViewProperty("/List/SEARCH", this.ViewModelBackup.List.SEARCH);
				this.setViewProperty("/List/TAGS", this.ViewModelBackup.List.TAGS);
				this.setViewProperty("/List/VARIANT", this.ViewModelBackup.List.VARIANT);

				this.setViewProperty("/List/STATUS", "");
				this.setViewProperty("/List/PHASE", "");
				this.setViewProperty("/List/CAMPAIGN", undefined);
				this.setViewProperty("/List/DUE", undefined);
				this.setViewProperty("/List/AUTHORS", []);
				this.setViewProperty("/List/COACHES", []);
				this.setViewProperty("/List/EXTENSION", {});
				this.setViewProperty("/List/RESP_VALUE_CODE", "");

				oFilterDialog.close();
			},

			// when overwritten functions of view can be redirected to search filter
			getFilterElementById: function(sId) {
				return this.byId(sId);
			},

			// when overwritten functions of view can be redirected to search filter
			createIdForFilterElement: function(sId) {
				if (sId) {
					return this.createId(sId);
				} else {
					return this.getView().getId();
				}
			},

			// when overwritten functions of view can be redirected to search filter
			setFilterModel: function(oModel, sName) {
				this.setModel(oModel, sName);
			},

			getFilterNavContainer: function() {
				if (!this._oNavContainer) {
					if (!Device.system.desktop) {
						this._oNavContainer = this.byId("dialogFilterFragment--navContainer");
					} else {
						this._oNavContainer = this.byId("panelFilterFragment--navContainer");
					}
				}
				return this._oNavContainer;
			},

			onFilterPageChange: function() {
				var oNavContainer = this.getFilterNavContainer();
				var oCurrentPage = oNavContainer.getCurrentPage();

				var aPages = oNavContainer.getPages();
				var aNavToPage = jQuery.grep(aPages, function(p) {
					return p.sId !== oCurrentPage.sId;
				});

				if (aNavToPage && aNavToPage.length > 0) {
					var oNavToPage = aNavToPage[0];
					if (oNavToPage !== aPages[0]) {
						oNavContainer.to(oNavToPage.sId, "slide");
					} else {
						oNavContainer.backToPage(oNavToPage.sId, "slide");
					}
				}
			},

			onMoreFilterChange: function(oEvent) {
				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				var oFilterContainer = aPages[0].getContent()[0];
				if (oFilterContainer.getItems().length > 3) {
					/*var oMoreFilters = this.getFilterElementById("filterItems");
				oMoreFilters.setVisible(true);*/
					this.setViewProperty("/List/IS_SHOW_MORE_FILTER", true);
					oEvent.getSource().setVisible(false);
					oFilterContainer.$().find('*[tabindex="0"]')[oFilterContainer.getItems().length - 1].focus();
				}
			},

			addSubFilterPageContent: function(vContent) {
				this.setViewProperty("/List/IS_FILTER_SUBPAGE", true);

				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				var oSubPage = aPages[1];

				oSubPage.addContent(vContent);
			},

			removeSubFilterPage: function() {
				this.setViewProperty("/List/IS_FILTER_SUBPAGE", false);

				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				var oSubPage = aPages[1];

				oSubPage.removeAllContent();
			},

			createViewModelBackup: function() {
				this.ViewModelBackup = jQuery.extend(true, {}, this.getViewProperty("/"));
				this.FilterItemModelBackup = jQuery.extend(true, {}, this.getModel("filterItemModel"));
			},

			getViewModelBackup: function() {
				return this.ViewModelBackup;
			},
			getFilterItemModelBackup: function() {
				return this.FilterItemModelBackup;
			},

			restoreViewModelBackup: function() {
				if (this.oViewModelBackup !== undefined) {
					this.setViewProperty("/", this.ViewModelBackup);
					this.ViewModelBackup = undefined;
				}
				if (this.FilterItemModelBackup !== undefined) {
					this.setModel("filterItemModel", this.FilterItemModelBackup);
					this.FilterItemModelBackup = undefined;
				}
			},

			resetViewModelBackup: function() {
				this.ViewModelBackup = undefined;
				this.FilterItemModelBackup = undefined;
			},

			getModel: function(sName) {
				return this.getView().getModel(sName);
			},

			setListProperty: function(sProperty, vValue) {
				return this.getModel("list").setProperty(sProperty, vValue);
			},

			getListProperty: function(sProperty) {
				return this.getModel("list").getProperty(sProperty);
			},

			getList: function() {
				// needs to be overwritten
				jQuery.sap.assert(false, "getList of sap.ino.vc.commons.BaseListController must not be called");
			},

			getItemTemplate: function() {
				// needs to be overwritten
				jQuery.sap.assert(false, "getItemTemplate of sap.ino.vc.commons.BaseListController must not be called");
			},

			addListToolbarContent: function(oControl) {
				//by default, add oControl after the last spacer or at the end if there is no spacer
				var oList = this.getList();
				var oToolbar = oList ? (oList.getHeaderToolbar && oList.getHeaderToolbar()) : undefined;
				var aContent = oToolbar ? (oToolbar.getContent && oToolbar.insertContent && oToolbar.getContent()) : undefined;
				if (jQuery.isArray(aContent)) {
					var iIdx = aContent.length - 1;
					for (var ii = aContent.length - 1; ii >= 0; ii--) {
						var oMetadata = aContent[ii].getMetadata && aContent[ii].getMetadata();
						var sName = oMetadata ? (oMetadata.getName && oMetadata.getName()) : undefined;
						if (sName === "sap.m.ToolbarSpacer") {
							iIdx = ii + 1;
							break;
						}
					}
					oToolbar.insertContent(oControl, iIdx);
				} else {
					jQuery.sap.assert(false, "addListToolbarContent of sap.ino.vc.commons.BaseListController failed");
				}
			},

			getPath: function() {
				return this._sPath;
			},

			setPath: function(sPath) {
				this._sPath = sPath;
			},

			addSorterConfig: function(vSorter, bEnd) {
				var sProperty = "/Sorter/Values";
				var aValues = this.getListProperty(sProperty);
				if (!aValues) {
					return;
				}

				var fnAdd = function(oSorter) {
					if (jQuery.grep(aValues, function(e) {
						return e.ACTION === oSorter.ACTION;
					}).length === 0) {
						if (bEnd) {
							aValues.push(oSorter);
						} else {
							aValues.unshift(oSorter);
						}
					}
				};

				if (jQuery.isArray(vSorter)) {
					vSorter.forEach(function(oSorter) {
						fnAdd(oSorter);
					});
				} else {
					fnAdd(vSorter);
				}

				this.setListProperty(sProperty, aValues);
			},

			removeSorterConfig: function(vSorter) {
				var sProperty = "/Sorter/Values";
				var aValues = this.getListProperty(sProperty);
				if (!aValues || aValues.length === 0) {
					return;
				}

				var fnRemove = function(oSorter) {
					aValues = jQuery.grep(aValues, function(oListSorter) {
						return oListSorter.ACTION !== oSorter.ACTION;
					});
				};

				if (jQuery.isArray(vSorter)) {
					vSorter.forEach(function(oSorter) {
						fnRemove(oSorter);
					});
				} else {
					fnRemove(vSorter);
				}

				this.setListProperty(sProperty, aValues);
			},

			getSorter: function() {
				return this._oSorter;
			},

			setSorter: function(oSorter) {
				this._oSorter = oSorter;
			},

			getFilter: function() {
				var aGlobalFilter = this.getGlobalFilter();
				var aFilter = this._aFilter || [];
				return aFilter.concat(aGlobalFilter);
			},

			setFilter: function(aFilter) {
				if (jQuery.type(aFilter) === "array") {
					this._aFilter = aFilter;
				} else {
					this._aFilter = aFilter ? [aFilter] : [];
				}
			},

			addFilter: function(oFilter) {
				if (!this._aFilter) {
					this._aFilter = [];
				}
				this._aFilter.push(oFilter);
			},

			getGlobalFilter: function() {
				return this._aGlobalFilter || [];
			},

			setGlobalFilter: function(aFilter) {
				if (jQuery.type(aFilter) === "array") {
					this._aGlobalFilter = aFilter;
				} else {
					this._aGlobalFilter = aFilter ? [aFilter] : [];
				}
			},

			addGlobalFilter: function(oFilter) {
				if (!this._aGlobalFilter) {
					this._aGlobalFilter = [];
				}
				this._aGlobalFilter.push(oFilter);
			},

			getGroupHeaderFactory: function() {
				return this._oGroupHeaderFactory;
			},

			setGroupHeaderFactory: function(oGroupHeaderFactory) {
				this._oGroupHeaderFactory = oGroupHeaderFactory;
			},

			bindList: function(fnCallback) {
				var that = this;
				//var a = this.getList();
				var oList = this.getList().bindItems({
					path: this.getPath(),
					template: this.getItemTemplate(),
					sorter: this.getSorter(),
					filters: this.getFilter(),
					groupHeaderFactory: this.getGroupHeaderFactory(),
					events: {
						dataRequested: function() {
							jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
								if (jQuery.type(oControl.setBusy) === "function") {
									oControl.setBusy(true);
								}
							});
						},
						dataReceived: function() {
							jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
								if (jQuery.type(oControl.setBusy) === "function") {
									oControl.setBusy(false);
								}
							});

							if (jQuery.type(fnCallback) === "function") {
								fnCallback.apply(this);
							}
						}
					}
				});
			},

			onListExport: function() {},

			onRefresh: function() {
				this.bindList();
			},

			onUpdateFinished: function() {
				var oRefresh = this.byId("pullToRefresh");
				if (oRefresh && typeof oRefresh.hide === "function") {
					oRefresh.hide();
				}

				this._updateListAccessibility();
			},

			// TODO as here is already a mix of variant and non-variant list controller, we should merge them!?
			navigateIntern: function(oQuery, bReplace, bOnlyDesktop) {
				if (bOnlyDesktop) {
					//no navigation on mobile phones yet
					if (!Device.system.desktop) {
						return;
					}
				}
				var sVariant = this.getViewProperty("/List/VARIANT");

				this.navigateTo(this.getCurrentRoute(), {
					"variant": sVariant,
					"query": oQuery
				}, bReplace, true);
			},

			_getListDefinitionEntry: function(sValue, sKey, sListPath) {
				var aValues = this.getListProperty(sListPath);
				if (!aValues) {
					return undefined;
				}

				var aValue = jQuery.grep(aValues, function(oValue) {
					return oValue[sKey] === sValue;
				});

				if (aValue && aValue.length > 0) {
					return aValue[0];
				}

				return undefined;
			},

			getSort: function(sAction) {
				return this._getListDefinitionEntry(sAction, "ACTION", "/Sorter/Values");
			},

			getStatus: function(sKey) {
				return this._getListDefinitionEntry(sKey, "KEY", "/Filter/Status");
			},

			onTagItemSelected: function(oEvent) {
				oEvent.oSource = oEvent.getSource().getContent()[0];
				this.onTagSelected(oEvent);
			},

			onTagSelected: function(oEvent) {
				var oSource = oEvent.getSource();
				if (!oSource.getEnabled()) {
					return;
				}
				var oTag = {
					ID: oSource.data("id"),
					NAME: encodeURIComponent(oSource.getText()),
					GROUP_ID: oSource.data("groupid")
				};
				var aTags = this.getViewProperty("/List/TAGS");
				aTags.push(oTag);
				this.setViewProperty("/List/TAGS", aTags);
				this.setViewProperty("/List/IS_TAGS_SELECTION", aTags.length > 0);

				//no navigation on mobile phones yet
				if (!Device.system.desktop) {
					this.bindTagCloud();
					return;
				}

				this.navigateIntern(this.getQuery(), true);
			},

			//inm tag group hierarchy
			onTagTreeSelectedDone: function(oEvent) {
				var oSource = oEvent.getSource();
				var aTag = [];
				var aUnSelrctedTag = [];
				var bFindTag = {
					"bFind": false
				};
				aTag = this.setSelectedTagGroup(aTag, this._oPopover.getModel().oData);
				this.updateTagHierarchy(aTag, this._oPopover.getModel().oData, bFindTag);
				aUnSelrctedTag = this.setUnSelectedTagGroup(aUnSelrctedTag, this._oPopover.getModel().oData);
				var sRootGroupId = this._oPopover.getModel().oData.tagGroupID ? this._oPopover.getModel().oData.tagGroupID : 'other';
				var aTags = this.getViewProperty("/List/TAGS") || [];
				aTags = aTags.concat(aTag);
				aTags = this.uniqTagGroup(aTags) || [];
				aTags = this.excludeUnSelectedTags(aTags, aUnSelrctedTag) || [];
				aTags.forEach(function(item) {
				    item.NAME = decodeURIComponent(item.NAME);
					item.NAME = encodeURIComponent(item.NAME);
					if(!item.ROOTGROUPID){
					    item.ROOTGROUPID = sRootGroupId;
					}
					
				});
				this.setViewProperty("/List/TAGS", aTags);
				this.setViewProperty("/List/IS_TAGS_SELECTION", aTags.length > 0);
				//no navigation on mobile phones yet
				if (!Device.system.desktop) {
					this.bindTagCloud();
					return;
				}
				this._oPopover.close();
				this.navigateIntern(this.getQuery(), true);

			},

			excludeUnSelectedTags: function(aAllTags, aExTags) {
				if (aAllTags.length > 0) {
					aExTags.forEach(function(oAllTag) {
						var bExclude = false;
						var sNum;
						aAllTags.forEach(function(oExTag, index) {
							if (!bExclude) {
								bExclude = oExTag.ID === oAllTag.ID ? true : false;
								if (bExclude) {
									sNum = index;
								}
							}
						});
						if (bExclude) {
							aAllTags.splice(sNum);
							bExclude = false;
						}
					});
				}
				return aAllTags;
			},

			onTagSelectionChange: function(oEvent) {
				var cxt = oEvent.getSource().getBindingContext();
				var path = cxt.getPath();
				this.validateChild(this._oPopover.getModel(), path);
				path = path.substring(0, path.lastIndexOf('/'));
				this.validateParent(this._oPopover.getModel(), path);
			},

			//sap ui commons TriStateCheckBox
			setVibilityTagIcon: function(code) {
				if (code === "TAG_GROUP") {
					return true;
				} else {
					return false;
				}
			},

			setVibilityTag: function(bDisplay) {
				if (bDisplay) {
					return true;
				} else {
					return false;
				}
			},

			uniqTagGroup: function(array) {
				var temp = [];
				for (var i = 0; i < array.length; i++) {
					var bNeed = true;
					for (var a = 0; a < temp.length; a++) {
						if (bNeed) {
							bNeed = temp[a].ID === array[i].ID ? false : true;
						}
					}
					if (bNeed) {
						temp.push(array[i]);
					}
				}
				return temp;

			},

			setSelectedTagGroup: function(aTag, tagHierarchy) {
				var oTag;
				var that = this;
				if (tagHierarchy.children) {
					tagHierarchy.children.forEach(function(object) {
						if (object.children) {
							that.setSelectedTagGroup(aTag, object);
						} else if (object.checked === "Checked") {
							oTag = {
								ID: object.TAG_ID,
								NAME: object.NAME,
								GROUP_ID: object.TAG_GROUP_ID
							};
							aTag.push(oTag);
						}
					});
				} else if (tagHierarchy instanceof Array) {
					tagHierarchy.forEach(function(object) {
						if (object.checked === "Checked") {
							oTag = {
								ID: object.ID,
								NAME: object.NAME,
								GROUP_ID: object.TAG_GROUP_ID
							};
							aTag.push(oTag);
						}
					});
				} else {
					if (tagHierarchy.checked === "Checked") {
						oTag = {
							ID: tagHierarchy.TAG_ID,
							NAME: tagHierarchy.NAME,
							GROUP_ID: tagHierarchy.TAG_GROUP_ID
						};
						aTag.push(oTag);
					}
				}

				return this.uniqTagGroup(aTag);
			},

			setUnSelectedTagGroup: function(aTag, tagHierarchy) {
				var oTag;
				var that = this;
				if (tagHierarchy.children) {
					tagHierarchy.children.forEach(function(object) {
						if (object.children) {
							that.setUnSelectedTagGroup(aTag, object);
						} else if (object.checked === "Unchecked") {
							oTag = {
								ID: object.TAG_ID,
								NAME: object.NAME,
								GROUP_ID: object.TAG_GROUP_ID
							};
							aTag.push(oTag);
						}
					});
				} else if (tagHierarchy instanceof Array) {
					tagHierarchy.forEach(function(object) {
						if (object.checked === "Unchecked") {
							oTag = {
								ID: object.ID,
								NAME: object.NAME,
								GROUP_ID: object.TAG_GROUP_ID
							};
							aTag.push(oTag);
						}
					});
				} else {
					if (tagHierarchy.checked === "Unchecked") {
						oTag = {
							ID: tagHierarchy.TAG_ID,
							NAME: tagHierarchy.NAME,
							GROUP_ID: tagHierarchy.TAG_GROUP_ID
						};
						aTag.push(oTag);
					}
				}

				return this.uniqTagGroup(aTag);
			},

			setChildState: function(obj, state) {
				var that = this;
				this.getChildren(obj).forEach(function(x) {
					x.checked = state;
					that.setChildState(x, state);
				});
			},

			validateChild: function(model, path) {
				var cur = model.getProperty(path);
				this.setChildState(cur, cur.checked);
			},

			getChildren: function(obj) {
				if (obj.children) {
					return obj.children;
				} else {
					return [];
				}

			},

			validateParent: function(model, path) {
				if (path === '/children' || path === '') {
					return;
				}
				var obj = model.getProperty(path);
				var state = 'Unchecked';
				var children = this.getChildren(obj);

				var selectedCount = children.filter(function(x) {
					return x.checked === 'Checked';
				}).length;

				if (selectedCount === children.length) {
					obj.checked = 'Checked';
				} else {
					var unselectedCount = children.filter(function(x) {
						return x.checked === 'Unchecked';
					}).length;

					if (unselectedCount === children.length) {
						obj.checked = 'Unchecked';
					} else {
						obj.checked = 'Mixed';
					}
				}

				model.setProperty(path, obj);
				path = path.substring(0, path.lastIndexOf('/'));
				if (path !== '/children') {
					this.validateParent(model, path);
				}
			},

			updateTagHierarchy: function(aTag, tagHierarchy, bFindTag) {
				var that = this;
				if (tagHierarchy.children) {
					tagHierarchy.children.forEach(function(object) {
						if (object.children) {
							that.updateTagHierarchy(aTag, object, bFindTag);
							if (object.checked === "Checked" && bFindTag.bFind) {
								object.checked = "Unchecked";
							}
						} else {
							var bNeed = false;
							aTag.forEach(function(oTag) {
								if (!bNeed) {
									bNeed = object.TAG_ID !== oTag.ID ? false : true;
								}
							});
							if (!bNeed) {
								object.checked = "Unchecked";
								bFindTag.bFind = true;
								bNeed = false;
							} else {
								object.checked = "Checked";
								bNeed = false;
							}
						}
					});
				} else if (tagHierarchy instanceof Array) {
					tagHierarchy.forEach(function(object) {
						var bNeed = false;
						aTag.forEach(function(oTag) {
							if (!bNeed) {
								bNeed = object.ID !== oTag.ID ? false : true;
							}
						});
						if (!bNeed) {
							object.checked = "Unchecked";
						} else {
							object.checked = "Checked";
							bNeed = false;
						}
					});

				} else {
					var bNeed = false;
					aTag.forEach(function(oTag) {
						if (!bNeed) {
							bNeed = tagHierarchy.TAG_ID !== oTag.ID ? false : true;
						}
					});
					if (!bNeed) {
						tagHierarchy.checked = "Unchecked";
						bFindTag.bFind = true;
						bNeed = false;
					} else {
						tagHierarchy.checked = "Checked";
						bNeed = false;
					}
				}
				return tagHierarchy;
			},

			updateTagHierarchyForFisrt: function(aTag, tagHierarchy) {
				var that = this;
				if (tagHierarchy.children) {
					tagHierarchy.children.forEach(function(object) {
						if (object.children) {
							that.updateTagHierarchyForFisrt(aTag, object);
						} else {
							var bNeed = false;
							aTag.forEach(function(oTag) {
								if (!bNeed) {
									bNeed = object.TAG_ID !== oTag.ID ? false : true;
								}
							});
							if (bNeed) {
								object.checked = "Checked";
								bNeed = false;
							}
						}
					});
				} else {
					var bNeed = false;
					aTag.forEach(function(oTag) {
						if (!bNeed) {
							bNeed = tagHierarchy.TAG_ID !== oTag.ID ? false : true;
						}
					});
					if (bNeed) {
						tagHierarchy.checked = "Checked";
						bNeed = false;
					}
				}
				return tagHierarchy;
			},

			onTagGroupSelected: function(oEvent) {
				var oSource = oEvent.getSource();
				var sModelName = "TagGroup-" + oEvent.getSource().getCustomData()[0].getValue();
				var GroupName =  oEvent.getSource().getCustomData()[1].getValue();
				if (!this._oPopover) {
					this._oPopover = sap.ui.xmlfragment("sap.ino.vc.commons.fragments.TagGroupPopover", this);
					this.getView().addDependent(this._oPopover);
				}
				var aTags = this.getViewProperty("/List/TAGS");

				var reqBody = {
					GROUP_ID: oEvent.getSource().getCustomData()[0].getValue(),
					TagList: this.getView().getModel("tag").getProperty("/RANKED_TAG")
				};

				// var reqBody = {
				// 	GROUP_ID: oEvent.getSource().getCustomData()[0].getValue(),
				// 	TagList: this.getView().getModel("tag").getProperty("/RANKED_TAG"),
				// 	TagHierarchy: this.getView().getModel(sModelName) ? this.getView().getModel(sModelName).oData : null
				// };
				var _oPopover = this._oPopover;
				var oTreeModel;

				var that = this;

				var oObjectData = jQuery.ajax({
					url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/tagGroupQuery.xsjs",
					type: "POST",
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify(reqBody),
					async: false

				});
				oObjectData.done(function(oResponse) {
					oTreeModel = new JSONModel(oResponse);
					if (that.getView().getModel(sModelName)) {
						var bFindTag = {
							"bFind": false
						};
						oResponse = that.updateTagHierarchy(aTags, oResponse, bFindTag);
						that.getView().getModel(sModelName).setData(oResponse);
					} else {
						that.updateTagHierarchyForFisrt(aTags, oTreeModel.oData);
						that.getView().setModel(oTreeModel, sModelName);
					}

				});
				//this._oPopover.bindElement("oResponse");
				// if (this.getView().getModel(sModelName)) {
				//     var bFindTag = {"bFind":false};
				// 	this.updateTagHierarchy(aTags, this.getView().getModel(sModelName).oData,bFindTag);
				// }
				this.getView().getModel(sModelName).setProperty("/RootGroupName",GroupName);
				_oPopover.setModel(this.getView().getModel(sModelName));
				this._oPopover.openBy(oEvent.getSource());
			},

			_deselectTag: function(iKey) {
				var aTags = this.getViewProperty("/List/TAGS");
				aTags = aTags.filter(function(tag) {
					return tag.ID !== iKey;
				});
				this.setViewProperty("/List/TAGS", aTags);
				this.setViewProperty("/List/IS_TAGS_SELECTION", aTags.length > 0);
                var oQuery = this.getQuery();
				if (aTags.length === 0) {
				    oQuery.tags = undefined;
					// after the last tag was selected, focus the tagcloud again
					setTimeout(function() {
						//that.byId("panelFilterFragment--tagCloud").focus();
						//that.byId("TagGroupList").focus();
					}, 0);
				}

				//no navigation on mobile phones yet
				if (!Device.system.desktop) {
					this.bindTagCloud();
					return;
				}

                
				this.navigateIntern(oQuery, true);
			},

			onTagItemDeselectPress: function(oEvent) {
				var iKey = parseInt(oEvent.getParameter("listItem").getContent()[0].getKey(), 10);
				if (!isNaN(iKey)) {
					this._deselectTag(iKey);
				}
			},

			onTagItemDelete: function(oEvent) {
				var iKey = parseInt(oEvent.getSource().getProperty("key"), 10);
				if (!isNaN(iKey)) {
					this._deselectTag(iKey);
				}
			}
		}));
});