/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
/* global Promise */
sap.ui.define(
	["sap/fe/macros/ValueListHelper", "sap/fe/macros/field/FieldHelper", "sap/m/MessageToast", "sap/base/Log"],
	function(ValueListHelper, FieldHelper, MessageToast, Log) {
		"use strict";
		var waitForPromise = {};
		var FEHelper = {
			launchValueHelpFromActionParameterDialog: function(propertyPath, oFVH, bSuggestion, oCustomModel) {
				var oModel = oFVH.getModel(),
					oMetaModel = oModel.getMetaModel(),
					oWrapper = oFVH.getContent && oFVH.getContent(),
					sWrapperId = oWrapper.getId(),
					oTable = oWrapper && oWrapper.getTable && oWrapper.getTable(),
					oFilterBar = oFVH && oFVH.getFilterBar && oFVH.getFilterBar(),
					bExists = oTable && oFilterBar,
					sPropertyName = oMetaModel.getObject(propertyPath + "@sapui.name");
				if (waitForPromise[sWrapperId] || bExists) {
					return;
				} else {
					if (!oTable) {
						waitForPromise[sWrapperId] = true;
					}
					ValueListHelper.getValueListInfo(oFVH, oMetaModel, propertyPath)
						.then(function(oValueListInfo) {
							if (oCustomModel) {
								var oPropertyAnnotations,
									oCollectionAnnotations,
									mValueListInfo = oValueListInfo.valueListInfo;
								//if custom model is provided, then display mode is set to the model to set textarrangement of field
								if (!oCustomModel.$displayMode) {
									oCustomModel.$displayMode = {};
								}
								oPropertyAnnotations = mValueListInfo.$model
									.getMetaModel()
									.getObject(oValueListInfo.fieldPropertyPath + "@");
								oCollectionAnnotations = mValueListInfo.$model
									.getMetaModel()
									.getObject("/" + mValueListInfo.CollectionPath + "/$Type@");
								oCustomModel.$displayMode[sPropertyName] = FieldHelper.displayMode(
									oPropertyAnnotations,
									oCollectionAnnotations
								);
							}
							oWrapper.setModel(oValueListInfo.valueListInfo.$model);
							return ValueListHelper.createValueHelpDialog(
								propertyPath,
								oFVH,
								oTable,
								oFilterBar,
								oValueListInfo,
								bSuggestion
							);
						})
						.catch(function(exc) {
							var sMsg =
								exc.status && exc.status === 404
									? "Metadata not found (" + exc.status + ") for value help of property " + propertyPath
									: exc.message;
							Log.error(sMsg);
							MessageToast.show(sMsg);
						});
				}
			}
		};
		return FEHelper;
	},
	/* bExport= */ true
);
