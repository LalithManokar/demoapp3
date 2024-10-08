/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayout");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.commons.TextField");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.commons.DropdownBox");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.config.IdeaFormModifyPreviewFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOView, {

		_getCodeListModel: function() {
			var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
			var oCodeListModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + "/" + sOdataPath, false);

			return oCodeListModel;
		},

		_getConfigModel: function() {
			var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_CONFIGURATION");
			var oConfigModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + "/" + sOdataPath, false);

			return oConfigModel;
		},

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.config.IdeaFormModifyPreviewFacet";
		},

		createFacetContent: function() {

			var oPreviewGroup = this.createLayoutPreview();
			return [oPreviewGroup];
		},
		createLayoutPreview: function() {
			var oController = this.getController();
			var oIdeaFromDetailThingGrup;

			var aFields = oController.getModel().getProperty(this._getFieldsPath());

			var oFieldsPreviewLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 2,
				widths: ['30%', '60%']
			});

			this.createFieldsPreview(oFieldsPreviewLayout, aFields);

			oIdeaFromDetailThingGrup = new sap.ui.ux3.ThingGroup({
				title: this.getController().getTextPath("BO_IDEA_FORM_ADMINISTRATION_PREVIEW_TIT"),
				content: [oFieldsPreviewLayout],
				colspan: true
			});

			return oIdeaFromDetailThingGrup;
		},

		createFieldsPreview: function(oFieldsPreviewLayout, aFields) {
			//remove all preivew fied

			var that = this;

			oFieldsPreviewLayout.removeAllRows();

			jQuery.each(aFields, function(iIdx, oField) {
				var oLabel, oFiledControl;

				if (oField.DATATYPE_CODE === "BOOLEAN") {
					if (oField.VALUE_OPTION_LIST_CODE === "" && oField.VALUE_OPTION_LIST_CODE !== undefined) {
						oFiledControl = new sap.ui.commons.CheckBox({
							tooltip: oField.DEFAULT_TEXT
						});
					} else {
						oFiledControl = that._createDropDownList(oField.VALUE_OPTION_LIST_CODE, oField.MANDATORY);
					}
				}

				if (oField.DATATYPE_CODE === "INTEGER" || oField.DATATYPE_CODE === 'NUMERIC' || oField.DATATYPE_CODE === "TEXT") {
					if (oField.VALUE_OPTION_LIST_CODE === "" && oField.VALUE_OPTION_LIST_CODE !== undefined) {
						oFiledControl = new sap.ui.commons.TextField({
							width: "300px"
						});
					} else {
						oFiledControl = that._createDropDownList(oField.VALUE_OPTION_LIST_CODE);
					}
				}

				if (oField.DATATYPE_CODE === "RICHTEXT") {
					if (oField.VALUE_OPTION_LIST_CODE === "" && oField.VALUE_OPTION_LIST_CODE !== undefined) {
						oFiledControl = new sap.ui.richtexteditor.RichTextEditor({
							width: "300px"
						});
					} else {
						oFiledControl = that._createDropDownList(oField.VALUE_OPTION_LIST_CODE);
					}
				}

				if (oField.DATATYPE_CODE === "DATE") {
					if (oField.VALUE_OPTION_LIST_CODE === "" && oField.VALUE_OPTION_LIST_CODE !== undefined) {
						oFiledControl = new sap.m.DatePicker({
							width: "300px"
						});
						oFiledControl.addStyleClass("sapUiSizeCompact");
					} else {
						oFiledControl = that._createDropDownList(oField.VALUE_OPTION_LIST_CODE);
					}
				}


				if (oField.IS_DISPLAY_ONLY) {
					oLabel = new sap.ui.core.HTML({
						content: oField.DISPLAY_TEXT,
						sanitizeContent: true
					});
					 oFiledControl = new sap.ui.core.HTML({
					content: "<br/>",
					sanitizeContent: true
				});
				} else {
				oLabel = that._getTextForLabel(oField, oFiledControl);
				oLabel.addStyleClass("sapInoIdeaFormLabelStyle");
				oLabel.addStyleClass(oField.MANDATORY ? "sapUiLblReqEnd" : "");				    
				}

				var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
					cells: [new sap.ui.commons.layout.MatrixLayoutCell({
						content: oLabel,
						vAlign: sap.ui.commons.layout.VAlign.Top,
						hAlign: sap.ui.commons.layout.HAlign.Begin
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: oFiledControl,
						vAlign: sap.ui.commons.layout.VAlign.Top,
						hAlign: sap.ui.commons.layout.HAlign.Begin
					})]
				});

				oFieldsPreviewLayout.addRow(oRow);
			});
		},

		_getTextForLabel: function(oField, oFiledControl) {
			var oLabel;

			if (oField.UOM_CODE) {
				oLabel = new sap.ui.commons.Label({
					text: {
						path: "DEFAULT_TEXT",
						formatter: function(sText) {
							return oField.DEFAULT_TEXT + "(" + sText + ")";
						}
					},
					tooltip: oField.DEFAULT_LONG_TEXT,
					labelFor: oFiledControl
				});

				oLabel.setModel(this._getConfigModel());
				oLabel.bindElement(this._getUomElementPath(oField.UOM_CODE));

				return oLabel;
			}

			oLabel = new sap.ui.commons.Label({
				text: oField.DEFAULT_TEXT,
				tooltip: oField.DEFAULT_LONG_TEXT,
				labelFor: oFiledControl
			});

			return oLabel;

		},

		_getUomElementPath: function(sUnitCode) {

			var sUnitPath = "/sap.ino.xs.object.basis.Unit.Root";

			return sUnitPath + "('" + sUnitCode + "')";
		},

		_createDropDownList: function(sValueOptionList) {
			var oitemsTemplate = new sap.ui.core.ListItem({
				text: "{DEFAULT_TEXT}"
			});

			var aFilters = [];
			var oFilter = new sap.ui.model.Filter("LIST_CODE", sap.ui.model.FilterOperator.EQ, sValueOptionList);

			aFilters.push(oFilter);

			var oComboBox = new sap.ui.commons.DropdownBox({
				items: {
					path: "/StagingValueOptions",
					filters: aFilters,
					sorter: new sap.ui.model.Sorter("SEQUENCE_NO", false),
					template: oitemsTemplate
				}
			});

			oComboBox.setModel(this._getCodeListModel());

			return oComboBox;
		},

		_getFieldsPath: function() {
			return "/Fields";
		}
	}));