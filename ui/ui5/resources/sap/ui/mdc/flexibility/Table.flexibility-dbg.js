/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/mdc/flexibility/SortFlex', 'sap/ui/mdc/flexibility/ColumnFlex'
], function(Sort, Column) {
	"use strict";
	// TODO: consider to generalize this and possible move some parts to a BaseFlex file
	return {
		"hideControl": "default",
		"unhideControl": "default",
		addColumn: Column.addColumn,
		removeColumn: Column.removeColumn,
		removeSort: Sort.removeSort,
		addSort: Sort.addSort
	};
}, /* bExport= */false);
