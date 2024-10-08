sap.ui.define([
    "./BaseListController",
    "sap/ui/Device",
    "sap/ino/commons/formatters/ListFormatter",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/ui/core/InvisibleText"
], function(BaseController, Device, ListFormatter, JSONModel, Configuration, Sorter, MessageBox, InvisibleText) {
	"use strict";

	var mOrder = {
		ASC: "ASC",
		DESC: "DESC"
	};

	var mSort = {
		SEARCH_SCORE: "SEARCH_SCORE"
	};

	return BaseController.extend("sap.ino.vc.commons.BaseVariantListController", {

		formatter: ListFormatter,

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);

			this._eOrientation = null;

			// only attach to orientation changes when the view is displayed =>
			// _onRouteMatched / _onAnyRouteMatched
			// sap.ui.Device.orientation.attachHandler(this._onOrientationChange,
			// this);
		},

		onExit: function() {
			this.getList().detachUpdateFinished(this.onUpdateFinished, this);
		},

		/* detect navigation within this view and between different views,
        based on this the filterbar is made visible or not */
		onAnyRouteMatched: function(oEvent) {
			// this function is call very often, so keep it as short as possible

			var sRoute = oEvent.getParameter("name");
			// make sure every list page open filter bar only once
			if (this.routes && this.routes.indexOf(sRoute) > -1) {
				this.openDefaultFilterBar();
			}

			if (!this._bInnerViewNavigation) {
				return;
			}

			//var sRoute = oEvent.getParameter("name");

			if (this.routes && this.routes.indexOf(sRoute) === -1) {
				// we are leaving the screen
				this._bInnerViewNavigation = false;
			}
		},

		openDefaultFilterBar: function() {
			if (this.getModel("filterItemModel")) {
				this.getModel("filterItemModel").setProperty("/isShowFilterSideFilterButtonGroup", false);
			}
			if (!Device.system.desktop) {
				return;
			}
			var oFilterButton = this.getFilterButton();
			var oFilterPanel = this.getFilterPanel();
			var oSortPanel = this.getSortPanel();
			var oObjectListLayout = this.getListLayout();
			var personalizeSetting = Configuration.getPersonalize();
			if (!personalizeSetting.FILTER) {
				if (oFilterPanel && oFilterPanel.hasStyleClass("sapInoFilterSidePanelVisible")) {
					if (this.getModel("filterItemModel")) {
						this.getModel("filterItemModel").setProperty("/isShowFilterSideFilterButtonGroup", true);
					}
				}
				return;
			}
			if (oFilterPanel && !oFilterPanel.hasStyleClass("sapInoFilterSidePanelVisible")) {
				if (oFilterButton) {
					oFilterButton.setPressed(true);
				}
				oObjectListLayout.addStyleClass("sapInoObjectListLayoutFit");
				oFilterPanel.addStyleClass("sapInoFilterSidePanelVisible");
				if (this.onSetFilterBarVisible) {
					this.onSetFilterBarVisible();
					if (this.getModel("filterItemModel")) {
						this.getModel("filterItemModel").setProperty("/isShowFilterSideFilterButtonGroup", true);
					}
				}
				if (oSortPanel) {
					oObjectListLayout.addStyleClass('sapInoObjectListLayoutTop');
					oSortPanel.addStyleClass('sapInoSortPanelLayoutFit');
				}
			}
			if (oFilterPanel && oFilterPanel.hasStyleClass("sapInoFilterSidePanelVisible")) {
				if (this.onSetFilterBarVisible) {
					this.onSetFilterBarVisible();
					if (this.getModel("filterItemModel")) {
						this.getModel("filterItemModel").setProperty("/isShowFilterSideFilterButtonGroup", true);
					}
				}
			}
		},

		setParameters: function(oQuery, oVariant) {
			// can be redefined
			oQuery = oQuery || {};

			//var oSorter = this.getSort(oVariant.DEFAULT_SORT);
			var sSort = this.checkSort(oQuery, oVariant.DEFAULT_SORT);
			/*var sOrder;
			if (oSorter) {
				sOrder = this.checkOrder(oQuery, oSorter.DEFAULT_ORDER);
			}*/
			var aTags = this.checkTags(oQuery.tags);

			this.setViewProperty("/List/VARIANT", oVariant.ACTION);
			this.setViewProperty("/List/SORT", sSort);
			this.setViewProperty("/List/QUICKSORT", oQuery.quickSort);
			//this.setViewProperty("/List/ORDER", sOrder);
			this.setViewProperty("/List/SEARCH", oQuery.search);
			this.setViewProperty("/List/TAGS", aTags);
			this.setViewProperty("/List/IS_TAGS_SELECTION", aTags.length > 0);
		},

		saveState: function(sVariant) {
			var sRoute = this.getCurrentRoute();
			sVariant = sVariant || this.getBindingParameter().Variant;
			var oQuery = this.getQuery({bFilterChange:true, bSorterChange: true});
			var bPortrait = Device.orientation.portrait;
			var iContextObjectId = this.getContextObjectId();
			this._oState = this.createState(sRoute, sVariant, oQuery, bPortrait, iContextObjectId);
		},

		createState: function(sRoute, sVariant, oQuery, bPortrait, iContextObjectId) {
			// can be redefined
			oQuery = oQuery || {};

			var oState = {
				route: sRoute,
				variant: sVariant,
				query: {
				// 	"sort": oQuery.sort,
				// 	"order": oQuery.order,
				// 	"search": oQuery.search,
				// 	"tags": oQuery.tags,
				// 	"quickSort": oQuery.quickSort,
				// 	"sIdeaFilterChange":oQuery.sIdeaFilterChange
				}
			};
			
			Object.keys(oQuery).forEach(function(sKey){
			    if(sKey){
			       oState.query[sKey] = oQuery[sKey]; 
			    }
			});
			
			if (bPortrait !== undefined) {
				oState.portrait = bPortrait;
			}
			if (iContextObjectId > 0) {
				oState.contextObjectId = iContextObjectId;
			}
			return oState;
		},

		hasStateChanged: function(sRoute, sVariant, oQuery, bPortrait, iContextObjectId) {
			return JSON.stringify(this.createState(sRoute, sVariant, oQuery, bPortrait, iContextObjectId)) !== JSON.stringify(this._oState);
		},

		getQuery: function() {
			//can be redefined
			var oQuery = {};

			var sSort = this.getViewProperty("/List/SORT");
			var quickSort = this.getViewProperty('/List/QUICKSORT');
			var sOrder = this.getViewProperty("/List/ORDER");
			var sSearchTerm = this.getViewProperty("/List/SEARCH");
			var aTags = this.getViewProperty("/List/TAGS");

			if (quickSort) {
				oQuery.quickSort = quickSort;
			}

			if (sSort) {
				oQuery.sort = sSort;
				if (sOrder) {
					oQuery.order = sOrder;
				}
			}
			if (sSearchTerm) {
				oQuery.search = sSearchTerm;
			}
			if (aTags && aTags.length > 0) {
				oQuery.tags = JSON.stringify(aTags);
			}

			return oQuery;
		},

		/* *************** VARIANTS *************** */

		getVariant: function(sAction) {
			return this._getListDefinitionEntry(sAction, "ACTION", "/Variants/Values");
		},

		getVariantsPopover: function() {
			if (!this._oVariantsPopover) {
				if (!Device.system.desktop) {
					this._oVariantsPopover = sap.ui.xmlfragment("sap.ino.vc.commons.fragments.ListVariantsDialog", this);
				} else {
					this._oVariantsPopover = sap.ui.xmlfragment("sap.ino.vc.commons.fragments.ListVariants", this);
				}
				this.getView().addDependent(this._oVariantsPopover);
			}
			return this._oVariantsPopover;
		},

		_onListVariants: function(oEvent) {
			var oButton = oEvent.getSource();
			var oPopover = this.getVariantsPopover();

			// focus the variants button after close again
			oPopover.attachAfterClose(function() {
				oButton.focus();
			}, this);

			if (typeof oPopover.openBy === "function") {
				oPopover.openBy(oButton);
			} else {
				oPopover.open();
			}
		},

		onListVariants: function() {
			this._onListVariants.apply(this, arguments);
		},

		onListVariatsClose: function() {
			this.getVariantsPopover().close();
		},

		onVariantPress: function(sVariantAction) {
			var oQuery = this.getQuery();

			// do not show invalid filters in URL => they are ignored, but we don't want to confuse users
			this.removeInvalidFilters(oQuery);

			// TODO: this should prevent navigation when source and target are same - doesn't work yet
			//if (!this.hasStateChanged(this.getRoute(true), sVariantAction, oQuery, Device.orientation.portrait)) {
			//    return;
			//}

			if (sVariantAction) {
				this.navigateTo(this.getRoute(true), {
					variant: sVariantAction,
					query: oQuery
				}, false, true);
			} else {
				this.navigateTo(this.getRoute(false), {
					query: oQuery
				}, false, true);
			}
		},

		removeInvalidFilters: function(oQuery) {

		},

		onVariantBasePress: function(oEvent) {
			var oItem = oEvent.getSource();
			if (oItem.getSelectedItem && oItem.getSelectedItem()) {
				oItem = oItem.getSelectedItem();
			}
			var oContext = oItem.getBindingContext("list");
			var sAction;
			var oObject;
            var previousSelect;
            
			if (oContext) {

				//////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// do not access idea-, campaign-, etc. specific functionaility here
				// in case of the search list "this" may be the wrong controller (change from campaign to idea list)
				//////////////////////////////////////////////////////////////////////////////////////////////////////////////

				oObject = oContext.getObject();
				sAction = oObject ? oObject.ACTION : undefined;
				this.setViewProperty("/List/VARIANT", sAction);
				this.setViewProperty("/List/CURRENTVAR", oObject);
			}

			this.setViewProperty("/List/SORT", undefined);
			this.setViewProperty("/List/ORDER", undefined);
			this.setViewProperty("/NAVIGATETOPLINK", false);
			this.getModel("list").setProperty("/CURRENTQUICKLINK" , undefined);
            this.getModel("list").setProperty("/CURRENTSELECTLINK" , oObject);
            this.getModel("list").setProperty("/TITLESELECTQUICKLINK" , oObject);
            this.getModel("list").setProperty("/List/SELECTQUICKLINKID" , oObject.ID);
            
			if (!Device.system.desktop) {
				//no navigation on mobile phones yet
				return;
			}
			if(oObject.ID){
			    this.setViewProperty("/List/SELECTQUICKLINKID", oObject.ID);
			}else{
			    this.setViewProperty("/List/SELECTQUICKLINKID", undefined);
			}
			if(oObject.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA"){
			    this.getModel("list").setProperty("/CURRENTQUICKLINK" , oObject);
				var sCustomerQuickLinkUrl = this.campaignId ? 
				    location.href.split("#")[0] + "#/campaign/" + this.campaignId + "/" + oObject.LINK_URL : 
				    location.href.split("#")[0] + "#/" + oObject.LINK_URL;
				this.navigateToByURL(sCustomerQuickLinkUrl);
			}/*else if(oObject.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && ){
			    var standardQuickLinkUrl = this.campaignId ? 
				    location.href.split("#")[0] + "#/campaign/" + this.campaignId + "/ideas-" + oObject.ACTION : 
				    location.href.split("#")[0] + "#/ideas-" + oObject.ACTION;
				this.navigateToByURL(standardQuickLinkUrl);
			}*/else{
			    this.onVariantPress(sAction, oEvent);
			}
		},

		/* *************** FILTER DIALOG *************** */

		//mobile phone use case
		onApplyFilter: function() {
			var oFilterDialog = this.byId("filterDialog");
			if (JSON.stringify(this.getViewModelBackup()) !== JSON.stringify(this.getViewProperty("/")) || JSON.stringify(this.getFilterItemModelBackup()) !==
				JSON.stringify(this.getModel("filterItemModel"))) {
				var oQuery = this.getQuery();

				var sVariant = this.getViewProperty("/List/VARIANT");
				if (sVariant === this.getListProperty("/Variants/DEFAULT_VARIANT")) {
					this.navigateTo(this.getRoute(false), {
						query: oQuery
					}, true, true);
				} else {
					this.navigateTo(this.getRoute(true), {
						variant: sVariant,
						query: oQuery
					}, true, true);
				}
			}
			this.resetViewModelBackup();
			oFilterDialog.close();
		},

		/* *************** DESKTOP FILTERBAR *************** */

		initialSorterItems: function() {
			if (!Device.system.desktop) {
				return;
			}
			var self = this;
			var aOrder = ["ASC", "DESC"];
			var sSort = this.getViewProperty("/List/SORT");
			if (!sSort) {
				return;
			}
			if (!this._oSorterContainer) {
				this._oSorterContainer = this.byId(this.getSortFragmnetId() + "--SorterContainer");
			}
			var aSortOrder = sSort.split(",");
			var oFlexBox;
			var that = this;
			var iCnt = 0;
			var _setSorterItem = function(items, sSortOrder) {
				var aSO = sSortOrder.split(" ");
				items[0].setSelectedKey(aSO[0]);
				items[1].setPressed(aOrder.indexOf(aSO[1]));
				self.setSorterIcon(items[1]);
			};

			oFlexBox = this._oSorterContainer.getItems()[0];
			_setSorterItem(oFlexBox.getItems(), aSortOrder.shift());

			if (aSortOrder.length > 0) {
				jQuery.each(aSortOrder, function(iIdx, sTSortOrder) {
					if (that._oSorterContainer.getItems()[iIdx + 1]) {
						oFlexBox = that._oSorterContainer.getItems()[iIdx + 1];
					} else {
						oFlexBox = that.addSorter(that._oSorterContainer);
					}
					_setSorterItem(oFlexBox.getItems(), sTSortOrder);
					iCnt = iIdx + 1;
				});
			}
			// remove no use sorter items
			var aItems = this._oSorterContainer.getItems();
			for (iCnt = iCnt + 1; iCnt < aItems.length; iCnt++) {
				this._oSorterContainer.removeItem(aItems[iCnt]);
				aItems[iCnt].destroy();
			}
			self.checkSorterLimit(self._oSorterContainer);
		},

		onSorterAdd: function(oEvent) {
			var oSorterContainer = this._oSorterContainer || oEvent.getSource().getParent().getParent();
			this.addSorter(oSorterContainer);
			this.checkSorterLimit(oSorterContainer);
			// BCP-1980515839: store the last focused element
			this._oLastFocusedControl = oEvent.getSource();
		},

		addSorter: function(oSorterContainer) {
			var fragment = this.createFragment("sap.ino.vc.commons.fragments.SorterItems");

			oSorterContainer.addItem(fragment);

			var aItems = oSorterContainer.getItems();
			var oFlexBox = aItems[aItems.length - 1].getItems();
			oFlexBox[0].insertItem(new sap.ui.core.Item({
				text: "",
				key: ''
			}), 0);
			// BCP-1980515839: focus the first object of sorter
			oFlexBox[0].addEventDelegate({
			    onAfterRendering: function(){
			        oFlexBox[0].focus();
			    }
			});
			return aItems[aItems.length - 1];
		},

		onSorterChange: function(oEvent) {
			var oSource = oEvent.getSource();
			if (!oSource.getSelectedItem().getProperty("key")) {
				return;
			}
			// if source select is not Sort Select
			if (oSource.getBindingPath("items").indexOf("Sorter") < 0) {
				var oSortSelect = oSource.getParent().getItems()[0];
				if (!oSortSelect.getSelectedItem().getProperty("key")) {
					return;
				}
			}

			var sSorterOrder = this.getSortCombination();
			if (sSorterOrder === "-1") {
				MessageBox.show(this.getText("MSG_REPEAT_IDEAT_SORTER"), MessageBox.Icon.INFORMATION, "", [
					MessageBox.Action.OK], function() {
					oSource.setSelectedKey("");
				});
				return;
			}
			this.setViewProperty("/List/SORT", sSorterOrder);
			this.navigateIntern(this.getQuery({bSorterChange: true}), true);
		},

		onSorterRemove: function(oEvent) {
			var oSorterContainer = oEvent.getSource().getParent().getParent();
			var oFlexBox = oEvent.getSource().getParent();
			if (oSorterContainer && oSorterContainer.indexOfItem(oFlexBox) > 0) {
				oSorterContainer.removeItem(oFlexBox);
				oFlexBox.destroy();
			}
			this.checkSorterLimit(oSorterContainer);
			// if is need to reload
			var sSorterOrder = this.getViewProperty("/List/SORT");
			var iSorterProperyCnt = sSorterOrder.split(",").length;
			var iSorterCnt = oSorterContainer.getItems().length - 1; // count the sorter number from all items(include bar element);
			if (iSorterProperyCnt > iSorterCnt) {
				// reload page
				this.setViewProperty("/List/SORT", this.getSortCombination());
				this.navigateIntern(this.getQuery({bSorterChange: true}), true);
			}
		    // BCP-1980515839: refocus the last focused element
		    var that = this;
			setTimeout(function(){
			    if(that._oLastFocusedControl){
			        that._oLastFocusedControl.focus();
			    }
			}, 2000);
		},

		setSorter: function(aSorter) {
			if (Object.prototype.toString.call(aSorter) !== "[object Array]") {
				aSorter = [aSorter];
			}
			var aTSorter = [];
			jQuery.each(aSorter, function(iIdx, oSorter) {
				if (oSorter instanceof Sorter) {
					aTSorter.push(oSorter);
				} else {
					aTSorter.push(new Sorter(oSorter.ACTION, oSorter.DEFAULT_ORDER === mOrder.DESC));
				}
			});
			this._oSorter = aTSorter;
		},

		getSort: function(sSorterOrder) {
			if (sSorterOrder) {
				var aSorterOrder = sSorterOrder.split(",");
				var that = this;
				var aSorter = [];
				jQuery.each(aSorterOrder, function(iIdx, sSorter) {
					var oSorter = BaseController.prototype.getSort.call(that, sSorter.split(" ")[0]);
					if (oSorter) {
						if (sSorter.split(" ")[1]) {
							oSorter.DEFAULT_ORDER = sSorter.split(" ")[1];
						}
						aSorter.push(oSorter);
					}
				});

				return aSorter;
			}
		},

		getQuickSort: function(quickSort) {
			var aQuickSorter = [],
				aSorterOrder;
			var quickSortSource = this.getListProperty('/QuickSorter');
			if (!quickSort || !quickSortSource || !quickSortSource.length) {
				return aQuickSorter;
			}
			aSorterOrder = quickSort.split(' ');

			for (var i = 0; i < quickSortSource.length; i++) {
				if (quickSortSource[i].ACTION === aSorterOrder[0]) {
					aQuickSorter.push(quickSortSource[i]);
				}
			}
			return aQuickSorter;
		},

		/**
		 * Get the sorter list value cambination
		 * if there are the same sorters in the list, it will return -1
		 */
		getSortCombination: function() {
			var aOrder = ["ASC", "DESC"];
			var sSortComb = "";
			var aSortKey = [];
			var bValid = true;
			var aSorterBox = this._oSorterContainer.getItems();
			// aSorterBox.shift();
			jQuery.each(aSorterBox, function(iIdx, oBox) {
				var oItems = oBox.getItems();
				var sSortKey = oItems[0].getSelectedItem().getProperty("key");
				var sOrderkey = oItems[1].getPressed() ? aOrder[1] : aOrder[0];
				// check exists the same sort item
				if (sSortKey !== "" && jQuery.inArray(sSortKey, aSortKey) === -1) {
					aSortKey.push(sSortKey);
					sSortComb += sSortKey + " " + sOrderkey + ",";
				} else if (jQuery.inArray(sSortKey, aSortKey) > -1) {
					bValid = false;
				}
			});
			if (bValid) {
				return sSortComb.slice(0, sSortComb.length - 1);
			} else {
				return "-1";
			}
		},

		setSortIcon: function(oOrder, sOrder) {
			var aIcons = ["sap-icon://sort-ascending", "sap-icon://sort-descending"];
			var aOrder = ["ASC", "DESC"];
			if (aOrder.indexOf(sOrder) === -1) {
				return;
			}
			if (oOrder && oOrder.setIcon) {
				oOrder.setIcon(aIcons[aOrder.indexOf(sOrder)]);
			}
		},

		reverseSort: function(bRun, oEvent) {
			var aOrders = ["ASC", "DESC"];
			var sSort = this.getViewProperty("/List/ORDER");
			// toggle sort order
			this.setViewProperty("/List/ORDER", aOrders[!aOrders.indexOf(sSort) ? 1 : 0]);
			this.setSortIcon(oEvent.getSource(), this.getViewProperty("/List/ORDER"));
			if (!bRun && !Device.system.desktop) {
				//no navigation on mobile phones yet
				return;
			}

			this.navigateIntern(this.getQuery(), false);
		},

		onListSortReverse: function() {
			this.reverseSort(true);
		},

		onSortReverse: function(oEvent) {
			this.reverseSort(false, oEvent);
		},

		resetFilter: function() {
			this.setViewProperty("/List/TAGS", []);
			this.setViewProperty("/List/IS_TAGS_SELECTION", false);
			this.setViewProperty("/List/SORT", "");
			this.setViewProperty("/List/QUICKSORT", "");

			if (!Device.system.desktop) {
				//no navigation on mobile phones yet
				return;
			}

			this.navigateIntern(this.getQuery({bFilterChange: true, bSorterChange: true}), true);
		},

		onFilterReset: function(oEvent) {
			this.resetFilter();
		},

		/* *************** HELPER *************** */
		// TODO move search stuff to global search controller
		checkSort: function(oQuery, sDefault) {
			var oSorter = {
				"TEXT": "SORT_MIT_SEARCH_SCORE",
				"ACTION": mSort.SEARCH_SCORE,
				"DEFAULT_ORDER": mOrder.DESC
			};

			if (oQuery && oQuery.search !== undefined /* "" is a valid search */ && (!this._oState || !this._oState.query.search)) {
				this.addSorterConfig(oSorter);
			} else if (oQuery && oQuery.search === undefined && (this._oState && !this._oState.query.search)) {
				this.removeSorterConfig(oSorter);
			}

			if (oQuery && oQuery.search !== undefined && !oQuery.sort) {
				return mSort.SEARCH_SCORE;
			}

			return oQuery && this.getSort(oQuery.sort) ? oQuery.sort : sDefault;
		},

		checkOrder: function(oQuery, sDefault) {
			/*
            if ((oQuery.search && (!this._oState || !this._oState.query.search)) ||
                    (oQuery.search && this._oState && this._oState.query.search && oQuery.search !== this._oState.query.search)) {
                return mOrder.DESC;
            }
            */

			if (jQuery.type(oQuery.order) === "string") {
				oQuery.order = oQuery.order.toUpperCase();

				if (oQuery.order === mOrder.ASC || oQuery.order === mOrder.DESC) {
					return oQuery.order;
				}
			}
			return sDefault;
		},

		checkTags: function(sTags) {
			try {
				return JSON.parse(sTags);
			} catch (e) {
				return [];
			}
		},
		
		checkRespList: function(sRespList) {
		    try {
				return JSON.parse(sRespList);
			} catch (e) {
				return [];
			}
		},

		getBindingParameter: function() {
			return {
				Variant: null,
				VariantFilter: null,
				SearchTerm: null,
				TagIds: []
			};
		},

		setContextObjectId: function(iContextObjectId) {
			this._iContextObjectId = iContextObjectId;
		},

		getContextObjectId: function() {
			return this._iContextObjectId;
		},

		/* the variant the view currently displays */
		getCurrentVariant: function() {
			return this.getVariant(this.getViewProperty("/List/VARIANT"));
		},

		getRoute: function(bVariant) {
			if (this.routes && this.routes.length) {
				if (bVariant) {
					return this.routes[1];
				} else {
					return this.routes[0];
				}
			}
			return undefined;
		},

		getFilterFragmentId: function() {
			return Device.system.desktop ? "panelFilterFragment" : "dialogFilterFragment";
		},

		getSortFragmnetId: function() {
			return Device.system.desktop ? "panelSortFragment" : "dialogFilterFragment";
		},

		setSorterIcon: function(source) {
			var aIcons = ["sap-icon://sort-ascending", "sap-icon://sort-descending"];
			return source.getPressed() ? source.setIcon(aIcons[1]) : source.setIcon(aIcons[0]);
		},

		onOrder: function(event) {
			var sSorterOrder = this.getSortCombination();

			this.setSorterIcon(event.getSource());
			this.setViewProperty("/List/SORT", sSorterOrder);
			if((sSorterOrder.split(" "))[1] === "ASC"){
				event.getSource().setTooltip(this.getText('EXP_ASCENDING_SORT_BUTTON'));
			}else if((sSorterOrder.split(" "))[1] === "DESC"){
				event.getSource().setTooltip(this.getText('EXP_DESCENGDING_SORT_BUTTON'));
			}
			this.navigateIntern(this.getQuery({bSorterChange: true}), true);
		},

		onQuickSort: function(event) {
			var param = event.getParameters();
			var item = param.item;
			var quickSort = item.getKey();
			var currentSort = this.getViewProperty('/List/QUICKSORT');
			if (currentSort === quickSort) {
				quickSort = '';
			}
			this.setViewProperty('/List/QUICKSORT', quickSort);
			this.navigateIntern(this.getQuery({bSorterChange: true}), true);

		},

		checkSorterLimit: function(oSorterContainer) {
			if (!oSorterContainer) {
				return false;
			}
			var items = oSorterContainer.getItems();
			var limit = this.getListProperty('/Sorter/Limit');
			if (!limit) {
				return false;
			}
			if (items.length >= limit) {
				this.setListProperty('/Sorter/disableAddButton', true);
			} else {
				this.setListProperty('/Sorter/disableAddButton', false);
			}
		},

		transListValue: function(list) {
			return list && !!list.length || false;
		},

		isDisable: function(bool) {
			return !bool;
		},
		
		quickSortEnable: function(sAction,sCurrentSort) {
		    if(sAction === "CHANGED_AT_DT" && sCurrentSort){
	            if(sAction === sCurrentSort.split(" ")[0]){
    			    return false;
    			}else{
    			    return true;
    			}
		    }else{
		        return true;
		    }
		}
		
	});
});