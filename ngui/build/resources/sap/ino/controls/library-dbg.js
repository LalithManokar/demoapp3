/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/library",
    "sap/m/library"
], function() {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: "sap.ino.controls",
		dependencies: ["sap.ui.core", "sap.m"],
		types: [],
		interfaces: [],
		controls: [
            "sap.ino.controls.ActiveNavigationListItem",
            "sap.ino.controls.Campaign",
            "sap.ino.controls.ColorBar",
            "sap.ino.controls.ColorPicker",
            "sap.ino.controls.ColorPickerLite",
            "sap.ino.controls.ColorRibbon",
            "sap.ino.controls.EvaluationMatrix",
            "sap.ino.controls.EvaluationMatrixItem",
            "sap.ino.controls.GenericStyle",
            "sap.ino.controls.HorizontalLine",
            "sap.ino.controls.IdeaCard",
            "sap.ino.controls.Image",
            "sap.ino.controls.ImageCropping",
            "sap.ino.controls.LabelledIcon",
            "sap.ino.controls.MobileTextEditor",
            "sap.ino.controls.NotificationHeadItem",
            "sap.ino.controls.ProcessIndicator",
            "sap.ino.controls.RichTextEditor",
            "sap.ino.controls.SidePanel",
            "sap.ino.controls.Vote",
            "sap.ino.controls.VoteDisplay",
            "sap.ino.controls.WrappingList"
        ],
		elements: [
            "sap.ino.controls.EvaluationData",
            "sap.ino.controls.EvaluationDataCriterionValue",
            "sap.ino.controls.EvaluationMatrixItem",
            "sap.ino.controls.NotificationHeadItem"
        ],
		version: "2.4.16"
	});
});