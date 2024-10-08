sap.ui.define([
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/Group",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ino/commons/application/Configuration",
	"sap/ino/commons/models/object/communityUser"
], function(PropertyModel, MessageToast, GroupServer, JSONModel, Filter, FilterOperator, Configuration, communityUser) {
	"use strict";

	var UserGroupMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	UserGroupMixin._memberRequestQueue = [];

	UserGroupMixin._bindUserGroupModel = function(View) {
		var bindView = View || this.getView();
		var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/public_user_group.xsjs";
		var groupJSONModel = new JSONModel(sPath);
		bindView.setModel(groupJSONModel, "USER_GROUPS");
		return groupJSONModel;
	};

	UserGroupMixin.onSearchUserGroup = function(event) {
		var inputSource = event.getSource();
		var toolbarSource = inputSource && inputSource.getParent();
		var tableSource = toolbarSource && toolbarSource.getParent();
		var searchKey = event.getParameter('query');
		var searchFilter = new Filter([
	            new Filter('GROUP_NAME', FilterOperator.Contains, searchKey),
	            new Filter('DESCRIPTION', FilterOperator.Contains, searchKey)
	    ]);
		tableSource.getBinding('rows').filter(searchFilter, "searchGroup");
		this.reBindSelectedData(tableSource);
	};

	UserGroupMixin.selectedNoneGroup = function(event) {
		var selected = event.getParameters().selected;
		var tableBehavior = selected ? 'RowOnly' : 'Row';
		var source = event.getSource();
		var table = source && source.getParent();
		table.setSelectionBehavior(tableBehavior);
		table.setEditable(!selected);
	};

	UserGroupMixin.putGroupSelected = function(tableView, valid) {
		if (!tableView) {
			return false;
		}
		var table = tableView;
		var tableValid = valid || false;
		var tableData = table.getModel('USER_GROUPS').getData();
		var selectedNoneGorup = tableData.SELECTED_NONE || false;
		var noneGroupID = tableData.noneGroupID[0].GROUP_ID;
		var selectedIndex = table.getSelectedIndices();
		var userId = Configuration.getCurrentUser().USER_ID;
		var selectedGroup = {
			keys: [],
			parameters: []
		};

		if (!selectedNoneGorup) {
			for (var i = 0; i < selectedIndex.length; i++) {
				selectedGroup.keys.push(table.getContextByIndex(selectedIndex[i]).getObject().GROUP_ID);
			}
		} else {

			selectedGroup.keys.push(noneGroupID);
		}

		if (!selectedGroup.keys.length && tableValid) {
			MessageToast.show(this.getText('USER_GROUP_SELECT_ERROR'));
			return false;
		}

		return this.createUserModel(userId).assignGroups(selectedGroup);
	};

	UserGroupMixin.reBindSelectedData = function(tableView) {
		var table = tableView;
		var tableData = table.getModel('USER_GROUPS').getData();
		var rowLength = tableData.total;
		var noneGroup = tableData.noneGroupID && tableData.noneGroupID.length && tableData.noneGroupID[0];
		var allRows = table.getBinding('rows').getContexts(0, rowLength);
		var selectedGroup = this.getModel('identityData>/groups').getData();

		table.setSelectionBehavior('Row');
		table.setEditable(true);

		if (selectedGroup && selectedGroup.length && noneGroup && selectedGroup[0].GROUP_ID === noneGroup.GROUP_ID) {
			table.getExtension()[0].setSelected(true);
			table.setSelectionBehavior('RowOnly');
			table.setEditable(false);
			table.setSelectedIndex(-1);
		}
		if (selectedGroup && allRows) {
			for (var i = 0; i < selectedGroup.length; i++) {
				for (var x = 0; x < allRows.length; x++) {
					if (selectedGroup[i].GROUP_ID === allRows[x].getObject().GROUP_ID) {
						table.addSelectionInterval(x, x);
					}
				}
			}
		}
	};
	UserGroupMixin.createUserModel = function(userId) {
		var setting = {
			readSource: {
				model: this.getDefaultODataModel()
			}
		};
		return new communityUser(userId, setting);
	};

	UserGroupMixin.transGroupVisible = function(value) {
		return !!value;
	};

	UserGroupMixin.getMemberGroups = function() {
		var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/group.xsjs";
		var userId = Configuration.getCurrentUser().USER_ID;
		return $.ajax({
			url: sPath,
			type: 'GET',
			data: {
				id: userId
			}
		});
	};

	UserGroupMixin.cantClose = function() {
		return false;
	};

	return UserGroupMixin;
});