/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
	"sap/suite/ui/generic/template/changeHandler/generic/RemoveElement"
], function(
	Utils,
	RemoveElement
) {
	"use strict";
	/**
	 * Change handler for removing a filter item.
	 *
	 * @alias sap.suite.ui.generic.template.changeHandler.RemoveFilterItem
	 * @author SAP SE
	 * @version 1.71.57
	 */

	var RemoveFilterItem = {};

	RemoveFilterItem.applyChange = function (oChange, oControl, mPropertyBag) {
		RemoveElement.applyChange(oChange, oControl, mPropertyBag);
	};

	RemoveFilterItem.revertChange = function(oChange, oControl, mPropertyBag) {
		//write revert change logic
	};

	RemoveFilterItem.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		oSpecificChangeInfo.custom = {};
		oSpecificChangeInfo.custom.fnGetRelevantElement = Utils.getSmartFilterBarControlConfiguration;
		oSpecificChangeInfo.custom.fnGetAnnotationIndex = Utils.getRecordIndexForSelectionField;
		RemoveElement.completeChangeContent(oChange, oSpecificChangeInfo, mPropertyBag);
	};

	return RemoveFilterItem;
},
/* bExport= */true);
