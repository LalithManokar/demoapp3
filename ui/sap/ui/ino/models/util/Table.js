/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.types.CaseInsensitiveFilterType");
jQuery.sap.declare("sap.ui.ino.models.util.Table");
(function() {
	"use strict";

	var oCaseInsensitiveFilterType = new sap.ui.ino.models.types.CaseInsensitiveFilterType();
	sap.ui.ino.models.util.Table = {};

	/**
	 * Enables case-insensitive filtering and sorting when column is used with an OData model
	 * @params {sap.ui.table.Column} oColumn
	 * @returns {sap.ui.table.Column}
	 */
	sap.ui.ino.models.util.Table.caseInsensitiveColumn = function(oColumn, bNotStr) {
		var sSortProperty = oColumn.getSortProperty();
		if (sSortProperty) {
			if (bNotStr) {
				oColumn.setSortProperty(sSortProperty);
			} else {
				oColumn.setSortProperty("tolower(" + sSortProperty + ")");
			}
		}

		var sFilterProperty = oColumn.getFilterProperty();
		if (!sFilterProperty) {
			return oColumn;
		}

		// the filter property name and type take care that the OData
		// $filter is sent like tolower(ATTRIBUTE) <operator> tolower('SearchTerm')
		if (bNotStr) {
			oColumn.setFilterProperty(sFilterProperty);
		} else {
			oColumn.setFilterProperty("tolower(" + sFilterProperty + ")");
		}
		oColumn.setFilterType(oCaseInsensitiveFilterType);
		return oColumn;
	};

})();