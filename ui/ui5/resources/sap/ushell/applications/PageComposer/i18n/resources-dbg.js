// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview This file handles the resource bundles.
 */

sap.ui.define(['sap/ui/model/resource/ResourceModel'],
	function(ResourceModel) {
	"use strict";

    // ensure that sap.ushell exists
    var resources = { };

    resources.getTranslationModel = function (sLocale) {
     // create translation resource model
        var oTranslationModel = new ResourceModel({
            bundleUrl : jQuery.sap.getModulePath(
                "sap.ushell.applications.PageComposer.i18n.i18n",
                ".properties"
            ),
            bundleLocale : sLocale
        });
        return oTranslationModel;
    };

    resources.i18nModel = resources.getTranslationModel(sap.ui.getCore().getConfiguration().getLanguage());
    resources.i18n = resources.i18nModel.getResourceBundle();


	return resources;

}, /* bExport= */ true);
