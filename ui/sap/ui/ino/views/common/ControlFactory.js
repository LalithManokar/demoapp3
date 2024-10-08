/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.ControlFactory");
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
	jQuery.sap.require("sap.ui.ino.controls.Slider");
	jQuery.sap.require("sap.ui.ino.controls.FileUploader");

	jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");

	jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
	jQuery.sap.require("sap.ui.ino.models.types.StringBooleanType");
	jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
	jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");

	jQuery.sap.require("sap.ui.ino.models.formatter.RoundedDecimalFormatter");

	jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
	jQuery.sap.require("sap.ui.ino.application.Message");

	/**
	 * Control factory gives a generic access to UI5 controls, according to application data types (TEXT, BOOLEAN,
	 * NUMERIC, INTEGER, TIMESTAMP, DATE). The returned control for the specified data type can be bound by a bound
	 * reference control (e.g. sap.ui.core.Element, sap.ui.core.Control), or the binding can be specified as a normal
	 * path string. It allows to define different criteria in a type description object influencing the returned
	 * control.
	 * - dataType: Application data type, one of TEXT, BOOLEAN, NUMERIC, INTEGER, TIMESTAMP, DATE. Depending on
	 * the data type, the value is bound by default against the value properties TEXT_VALUE, BOOL_VALUE or NUM_VALUE in
	 * the referenced model or against an explicit attribute.
	 *
	 * Type Description:
	 *
	 * Mandatory:
	 * - bindingRef: Either a bound object, the binding is taken from or a string binding path
	 *
	 * Optional:
	 * - model: The referenced binding model in case bindingRef is a string path
	 * - modelName: The name of referenced binding model in case bindingRef is a string path
	 * - editable: Specifies if the returned control is statically editable or not
	 * - editableBinding: A binding string to determine if the control is dynamically editable
	 * - valueOptionListCode: Code of the value option list, the respective value property is looked up
	 * - codeTable: Name of the code table, the respective value property is looked up
	 * - includeEmptyCode: Include an empty code into the code table
	 * - foreignKeyTo: Control is a reference to another object instance
	 * - minValue: In case of data type NUMERIC or INTEGER, the minimum allowed value
	 * - maxValue: In case of data type NUMERIC or INTEGER, the maximum allowed value
	 * - maxLength: In case of data type TEXT, the maximum number of characters
	 * - required: Specifies if an non-empty value of the control is mandatory
	 * - validationHandler : A validation handler called for data type violations
	 * - link: In case UI5 control is a textual control, it will be converted to a link
	 * - linkPress: Function, that is called, when the link is pressed (optional)
	 * - linkHref: Hyper reference of the link
	 * - linkTarget: Target of the link href
	 * - slider: Is numeric/integer property with min and max represented as an slider control
	 * - tooltip: Is tooltip attached to the control
	 * - tooltipPrefix: A prefix that is added to the tooltip, in case it is no tooltip for a codeTable
	 * - mobile: Instantiate mobile controls
	 * - width: width of the control in px or %
	 * - blob: aggregates the attributes required by FileUploader control for renderign BLOBs
	 */

	function _getApplicationBase() {
		return sap.ui.ino.application.ApplicationBase.getInstance();
	};

	function _getUITextResourceBundle() {
		return sap.ui.getCore().getModel("i18n").getResourceBundle();
	};

	function _getMessageResourceBundle() {
		return sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
	};

	var mControlFactory = {
		TextView: {
			desktop: sap.ui.commons && sap.ui.commons.TextView,
			mobile: sap.m && sap.m.Text
		},
		Link: {
			desktop: sap.ui.commons && sap.ui.commons.Link,
			mobile: sap.m && sap.m.Link
		},
		TextArea: {
			desktop: sap.ui.commons && sap.ui.commons.TextArea,
			mobile: sap.m && sap.m.TextArea
		},
		TextField: {
			desktop: sap.ui.commons && sap.ui.commons.TextField,
			mobile: sap.m && sap.m.Input
		},
		CheckBox: {
			desktop: sap.ui.commons && sap.ui.commons.CheckBox,
			mobile: sap.m && sap.m.CheckBox
		},
		DatePicker: {
			desktop: sap.ui.commons && sap.ui.commons.DatePicker,
			mobile: sap.m && sap.m.DatePicker
		},
		DropDownBox: {
			desktop: sap.ui.commons && sap.ui.commons.DropdownBox,
			mobile: sap.m && sap.m.Select
		},
		FileUploader: {
			desktop: sap.ui.commons && sap.ui.commons.DropdownBox,
			mobile: sap.m && sap.m.Select
		}
	};

	function _getControlFactory(sControlType, bMobile) {
		var sDeviceType = !!bMobile ? "mobile" : "desktop";
		if (mControlFactory[sControlType] && mControlFactory[sControlType][sDeviceType]) {
			return mControlFactory[sControlType][sDeviceType];
		}
		throw new Error("No factory function defined for control type '" + sControlType + "' and device type '" + sDeviceType + "'");
	};

	function _getValueProperty(sDataType) {
		switch (sDataType) {
			case 'INTEGER':
			case 'NUMERIC':
				return 'numValue';
			case 'BOOLEAN':
				return 'boolValue';
			case 'TEXT':
				return 'textValue';
		}
		return null;
	};

	sap.ui.ino.views.common.ControlFactory = {

		/**
		 * Get generic control for type description according to specified data type including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlForType: function(oTypeDescr) {
			switch (oTypeDescr.dataType) {
				case 'BOOLEAN':
					return sap.ui.ino.views.common.ControlFactory.getValueControlBoolean(oTypeDescr);
				case 'TEXT':
					return sap.ui.ino.views.common.ControlFactory.getValueControlText(oTypeDescr);
				case 'INTEGER':
				case 'NUMERIC':
					return sap.ui.ino.views.common.ControlFactory.getValueControlNumericInteger(oTypeDescr);
				case 'TIMESTAMP':
					return sap.ui.ino.views.common.ControlFactory.getValueControlTimestamp(oTypeDescr);
				case 'DATE':
					return sap.ui.ino.views.common.ControlFactory.getValueControlDate(oTypeDescr);
			};
			return null;
		},

		/**
		 * Get generic control for type description according to specified data type including value property binding
		 *
		 * @param sProperty
		 *            name of the property bound against the control
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlForType: function(sProperty, oTypeDescr) {
			switch (oTypeDescr.dataType) {
				case 'BOOLEAN':
					return sap.ui.ino.views.common.ControlFactory.getControlBoolean(sProperty, oTypeDescr);
				case 'TEXT':
					return sap.ui.ino.views.common.ControlFactory.getControlText(sProperty, oTypeDescr);
				case 'INTEGER':
				case 'NUMERIC':
					return sap.ui.ino.views.common.ControlFactory.getControlNumericInteger(sProperty, oTypeDescr);
				case 'TIMESTAMP':
					return sap.ui.ino.views.common.ControlFactory.getControlTimestamp(sProperty, oTypeDescr);
				case 'DATE':
					return sap.ui.ino.views.common.ControlFactory.getControlDate(sProperty, oTypeDescr);
				case 'BLOB':
					return sap.ui.ino.views.common.ControlFactory.getControlBLOB(sProperty, oTypeDescr);
			};
			return null;
		},

		/**
		 * Get boolean control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlBoolean: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlBoolean(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get boolean control for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlBoolean: function(sProperty, oTypeDescr) {
			if (oTypeDescr.codeTable) {
				return sap.ui.ino.views.common.ControlFactory.getControlTableCode(sProperty, oTypeDescr);
			} else if (oTypeDescr.valueOptionListCode) {
				return sap.ui.ino.views.common.ControlFactory.getControlValueOptionList(sProperty, oTypeDescr);
			} else {
				if (!!oTypeDescr.editable) {
					return sap.ui.ino.views.common.ControlFactory._bindControl({
						control: new(_getControlFactory("CheckBox", oTypeDescr.mobile))({
							id: oTypeDescr.id,
							enabled: oTypeDescr.editableBinding ? {
								path: oTypeDescr.editableBinding
							} : undefined,
							width: oTypeDescr.width || undefined
						}),
						property: sProperty,
						controlProperty: oTypeDescr.mobile ? "selected" : "checked",
						typeDescr: oTypeDescr,
						propertyType: new sap.ui.ino.models.types.IntBooleanType(),
						tooltipType: new sap.ui.ino.models.types.StringBooleanType()
					});
				} else {
					if (!!oTypeDescr.link) {
						var oLink = sap.ui.ino.views.common.ControlFactory._bindControl({
							control: new(_getControlFactory("Link", oTypeDescr.mobile))({
								id: oTypeDescr.id,
								href: oTypeDescr.linkHref,
								target: oTypeDescr.linkTarget,
								width: oTypeDescr.width || undefined
							}),
							property: sProperty,
							controlProperty: "text",
							typeDescr: oTypeDescr,
							propertyType: new sap.ui.ino.models.types.StringBooleanType(),
							tooltipType: new sap.ui.ino.models.types.StringBooleanType()
						});
						if (oTypeDescr.linkPress) {
							oLink.attachPress(oTypeDescr.linkPress);
						}
						return oLink;
					} else {
						return sap.ui.ino.views.common.ControlFactory._bindControl({
							control: new(_getControlFactory("TextView", oTypeDescr.mobile))({
								id: oTypeDescr.id,
								maxLength: oTypeDescr.maxLength,
								width: oTypeDescr.width || undefined
							}),
							property: sProperty,
							controlProperty: "text",
							typeDescr: oTypeDescr,
							propertyType: new sap.ui.ino.models.types.StringBooleanType(),
							tooltipType: new sap.ui.ino.models.types.StringBooleanType()
						});
					}
				}
			}
		},

		/**
		 * Get text control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlText: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlText(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get text control for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlText: function(sProperty, oTypeDescr) {
			if (oTypeDescr.codeTable) {
				return sap.ui.ino.views.common.ControlFactory.getControlTableCode(sProperty, oTypeDescr);
			} else if (oTypeDescr.valueOptionListCode) {
				return sap.ui.ino.views.common.ControlFactory.getControlValueOptionList(sProperty, oTypeDescr);
			} else {
				if (!!oTypeDescr.editable) {
					return sap.ui.ino.views.common.ControlFactory._bindControl({
						control: new(_getControlFactory("TextArea", oTypeDescr.mobile))({
							id: oTypeDescr.id,
							maxLength: oTypeDescr.maxLength,
							enabled: oTypeDescr.editableBinding ? {
								path: oTypeDescr.editableBinding
							} : undefined,
							required: !!oTypeDescr.required,
							width: oTypeDescr.width || undefined
						}),
						property: sProperty,
						controlProperty: "value",
						typeDescr: oTypeDescr
					});
				} else {
					var oFormatter = undefined;
					if (oTypeDescr.dataType === "INTEGER") {
						oFormatter = function(vValue) {
							return Math.round(vValue).toString();
						};
					} else if (oTypeDescr.dataType === "NUMERIC") {
						oFormatter = sap.ui.ino.models.formatter.RoundedDecimalFormatter.getFormatter(2);
					}
					if (!!oTypeDescr.link) {
						var oLink = sap.ui.ino.views.common.ControlFactory._bindControl({
							control: new(_getControlFactory("Link", oTypeDescr.mobile))({
								id: oTypeDescr.id,
								href: oTypeDescr.linkHref,
								target: oTypeDescr.linkTarget,
								width: oTypeDescr.width || undefined
							}),
							property: sProperty,
							propertyType: null,
							controlProperty: "text",
							typeDescr: oTypeDescr,
							formatter: oFormatter
						});
						if (oTypeDescr.linkPress) {
							oLink.attachPress(oTypeDescr.linkPress);
						}
						return oLink;
					} else {
						return sap.ui.ino.views.common.ControlFactory._bindControl({
							control: new(_getControlFactory("TextView", oTypeDescr.mobile))({
								id: oTypeDescr.id,
								maxLength: oTypeDescr.maxLength,
								width: oTypeDescr.width || undefined
							}),
							property: sProperty,
							propertyType: null,
							controlProperty: "text",
							typeDescr: oTypeDescr,
							formatter: oFormatter
						});
					}
				}
			}
		},

		/**
		 * Get BLOB control for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlBLOB: function(sProperty, oTypeDescr) {
			var oBackgroundImageFileUploader = new sap.ui.ino.controls.FileUploader({
				uploadTooltip: oTypeDescr.blob.oUploadTooltip,
				attachmentId: oTypeDescr.blob.oAttachmentId,

				style: oTypeDescr.blob.oStyle,
				accept: oTypeDescr.blob.sAccept,
				multiple: oTypeDescr.blob.bMultiple,
				imageDefaultValue: oTypeDescr.blob.sImageDefaultValue,

				uploadSuccessful: oTypeDescr.blob.fUploadSuccessful,
				uploadFailed: oTypeDescr.blob.fUploadFailed,
				clearSuccessful: oTypeDescr.blob.fClearSuccessful,
				clearFailed: oTypeDescr.blob.fClearFailed
			});

			return oBackgroundImageFileUploader;
		},

		/**
		 * Get numeric/integer control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlNumericInteger: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlNumericInteger(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get numeric/integer for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlNumericInteger: function(sProperty, oTypeDescr) {
			if (oTypeDescr.codeTable) {
				return sap.ui.ino.views.common.ControlFactory.getControlTableCode(sProperty, oTypeDescr);
			} else if (oTypeDescr.valueOptionListCode) {
				return sap.ui.ino.views.common.ControlFactory.getControlValueOptionList(sProperty, oTypeDescr);
			} else if (oTypeDescr.foreignKeyTo) {
				return sap.ui.ino.views.common.ControlFactory.getControlObjectInstanceSelector(sProperty, oTypeDescr);
			} else {
				var oType = sap.ui.ino.views.common.ControlFactory._getTypeForDataType(oTypeDescr);
				var nStepSize = oTypeDescr.stepSize;
				if (!nStepSize && oTypeDescr.dataType === "INTEGER") {
					nStepSize = 1;
				}
				if (oTypeDescr.minValue !== undefined && oTypeDescr.minValue !== null && oTypeDescr.maxValue !== undefined && oTypeDescr.maxValue !==
					null && oTypeDescr.minValue != oTypeDescr.maxValue && !!oTypeDescr.slider && !oTypeDescr.mobile) {
					var oSlider = new sap.ui.ino.controls.Slider({
						id: oTypeDescr.id,
						totalUnits: 1,
						stepLabels: true,
						smallStepWidth: nStepSize,
						min: oTypeDescr.minValue,
						max: oTypeDescr.maxValue,
						editable: !!oTypeDescr.editable,
						readOnly: !oTypeDescr.editable,
						width: oTypeDescr.width || undefined
					});
					oSlider.valueDataType = oTypeDescr.dataType;
					return sap.ui.ino.views.common.ControlFactory._bindControl({
						control: oSlider,
						property: sProperty,
						controlProperty: "value",
						typeDescr: oTypeDescr,
						propertyType: oType
					});
				} else {
					if (!!oTypeDescr.editable) {
						var oTextField = new(_getControlFactory("TextField", oTypeDescr.mobile))({
							id: oTypeDescr.id,
							enabled: oTypeDescr.editableBinding ? {
								path: oTypeDescr.editableBinding
							} : undefined,
							required: !!oTypeDescr.required,
							maxLength: oTypeDescr.maxLength,
							width: oTypeDescr.width || undefined,
							change: function(oEvent) {
								if (this.liveValidate) {
									this.liveValidate(this, oEvent.getParameters().newValue, true, true);
								}
							},
							liveChange: function(oEvent) {
								if (this.liveValidate) {
									this.liveValidate(this, oEvent.getParameters().liveValue, false, true);
								}
							}
						});

						oTextField.typeDescr = oTypeDescr;
						if (oTypeDescr.validationHandler) {
							oTextField.liveValidate = sap.ui.ino.views.common.ControlFactory._attachLiveValidation;
							oTextField.liveValidate(oTextField, oTextField.getValue(), true, false);
						}
						return sap.ui.ino.views.common.ControlFactory._bindControl({
							control: oTextField,
							property: sProperty,
							controlProperty: "value",
							typeDescr: oTypeDescr,
							propertyType: oType
						});
					} else {
						return sap.ui.ino.views.common.ControlFactory.getControlText(sProperty, oTypeDescr);
					}
				}
			}
		},

		/**
		 * Get timestamp control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlTimestamp: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlTimestamp(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get timestamp for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlTimestamp: function(sProperty, oTypeDescr) {
			var oPropertyType = new sap.ui.model.type.Date({
				style: "medium"
			});
			if (!!oTypeDescr.editable) {
				return sap.ui.ino.views.common.ControlFactory._bindControl({
					control: new(_getControlFactory("DatePicker", oTypeDescr.mobile))({
						id: oTypeDescr.id,
						locale: _getUITextResourceBundle().sLocale,
						enabled: oTypeDescr.editableBinding ? {
							path: oTypeDescr.editableBinding
						} : undefined,
						required: !!oTypeDescr.required,
						width: oTypeDescr.width || undefined
					}),
					property: sProperty,
					controlProperty: "value",
					typeDescr: oTypeDescr,
					propertyType: oPropertyType,
					tooltipType: oPropertyType
				});
			} else {
				return sap.ui.ino.views.common.ControlFactory._bindControl({
					control: new(_getControlFactory("TextView", oTypeDescr.mobile))({
						id: oTypeDescr.id,
						width: oTypeDescr.width || undefined
					}),
					property: sProperty,
					controlProperty: "text",
					typeDescr: oTypeDescr,
					propertyType: oPropertyType,
					tooltipType: oPropertyType
				});
			}
		},

		/**
		 * Get date control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlDate: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlDate(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get date for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlDate: function(sProperty, oTypeDescr) {
			var oPropertyType = new sap.ui.model.type.Date({
				style: "medium"
			});
			if (!!oTypeDescr.editable) {
				return sap.ui.ino.views.common.ControlFactory._bindControl({
					control: new(_getControlFactory("DatePicker", oTypeDescr.mobile))({
						id: oTypeDescr.id,
						enabled: oTypeDescr.editableBinding ? {
							path: oTypeDescr.editableBinding
						} : undefined,
						required: !!oTypeDescr.required,
						width: oTypeDescr.width || undefined
					}),
					property: sProperty,
					controlProperty: "value",
					typeDescr: oTypeDescr,
					propertyType: oPropertyType,
					tooltipType: oPropertyType
				});
			} else {
				return sap.ui.ino.views.common.ControlFactory._bindControl({
					control: new(_getControlFactory("TextView", oTypeDescr.mobile))({
						id: oTypeDescr.id,
						width: oTypeDescr.width || undefined
					}),
					property: sProperty,
					controlProperty: "text",
					typeDescr: oTypeDescr,
					propertyType: oPropertyType,
					tooltipType: oPropertyType
				});
			}
		},

		/**
		 * Get object instance selector control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlObjectInstanceSelector: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlObjectInstanceSelector(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get object instance selector for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlObjectInstanceSelector: function(sProperty, oTypeDescr) {
			var oSelectionDefinition = sap.ui.ino.views.common.ObjectInstanceSelection.getDefinition(oTypeDescr.foreignKeyTo);
			var oSelectionFieldFormatter = function(iId) {
				var sSelectionField = "";
				if (iId) {
					var that = this;
					// Is could be a performance issue, as the formatter is executed synch.
					sap.ui.getCore().getModel().read("/" + oSelectionDefinition.instancePath + "(" + iId + ")", null, ["$select=" + oSelectionDefinition
							.selectionField + (oSelectionDefinition.secondarySelectionField ? "," + oSelectionDefinition.secondarySelectionField : "")], false,
						function(oData) {
							sSelectionField = oData[oSelectionDefinition.selectionField];
							if (sSelectionField) {
								sSelectionField = sSelectionField.toString();
							}
							if (!!oTypeDescr.tooltip) {
								if (oSelectionDefinition.secondarySelectionField && oData[oSelectionDefinition.secondarySelectionField]) {
									that.setTooltip(oData[oSelectionDefinition.secondarySelectionField]);
								} else {
									that.setTooltip(sSelectionField);
								}
							}
						});
				}
				return sSelectionField;
			};
			if (!!oTypeDescr.editable) {
				var oControl = sap.ui.ino.views.common.ControlFactory._bindControl({
					control: new sap.ui.ino.controls.AutoComplete({
						placeholder: {
							parts: [{
								path: "i18n>MW_COMMON_OIS_TYPE_TO_SEARCH_FOR",
                            }, {
								path: "i18n>" + oSelectionDefinition.name,
                            }],
							formatter: function(sSearch, sObject) {
								return sSearch + " " + sObject;
							}
						},
						tooltip: {
							parts: [{
								path: "i18n>MW_COMMON_OIS_TYPE_TO_SEARCH_FOR",
                            }, {
								path: "i18n>" + oSelectionDefinition.name,
                            }],
							formatter: function(sSearch, sObject) {
								return sSearch + sObject;
							}
						},
						maxPopupItems: 10,
						displaySecondaryValues: !!oSelectionDefinition.secondarySelectionField,
						width: oTypeDescr.width || undefined,
						suggest: function(oEvent) {
							var sValue = encodeURIComponent(jQuery.trim(oEvent.getParameter("suggestValue")));
							var oListTemplate = new sap.ui.core.ListItem({
								key: "{" + oSelectionDefinition.selectionKey + "}",
								text: "{" + oSelectionDefinition.selectionField + "}",
								additionalText: oSelectionDefinition.secondarySelectionField ? "{" + oSelectionDefinition.secondarySelectionField + "}" : undefined
							});
							oEvent.getSource().bindAggregation("items", {
								path: oSelectionDefinition.searchPath.replace("{searchToken}", sValue),
								template: oListTemplate,
								parameters: oSelectionDefinition.parameters
							});
						}
					}),
					property: sProperty,
					controlProperty: "selectedKey",
					typeDescr: oTypeDescr
				});
				oControl = sap.ui.ino.views.common.ControlFactory._bindControl({
					control: oControl,
					property: sProperty,
					propertyType: null,
					formatter: oSelectionFieldFormatter,
					controlProperty: "value",
					typeDescr: oTypeDescr
				});
				oControl.setFilterFunction(function(sValue, oItem) {
					return true;
				});
				return oControl;
			} else {
				var sNavigationPath = undefined;
				if (oSelectionDefinition.navigation) {
					var sAppCode = sap.ui.ino.application.ApplicationBase.getApplication().getApplicationCode();
					sNavigationPath = oSelectionDefinition.navigation[sAppCode];
				}
				if (sNavigationPath) {
					var oLink = sap.ui.ino.views.common.ControlFactory._bindControl({
						control: new(_getControlFactory("Link", oTypeDescr.mobile))({
							id: oTypeDescr.id,
							target: "_blank",
							width: oTypeDescr.width || undefined
						}),
						property: sProperty,
						propertyType: null,
						formatter: oSelectionFieldFormatter,
						controlProperty: "text",
						typeDescr: oTypeDescr,
					});
					oLink = sap.ui.ino.views.common.ControlFactory._bindControl({
						control: oLink,
						property: sProperty,
						propertyType: null,
						formatter: function(iId) {
							return sap.ui.ino.application.ApplicationBase.getApplication().getNavigationLink(sNavigationPath, iId);
						},
						controlProperty: "href",
						typeDescr: oTypeDescr
					});
					if (oTypeDescr.linkPress) {
						oLink.attachPress(oTypeDescr.linkPress);
					}
					return oLink;
				} else {
					return sap.ui.ino.views.common.ControlFactory._bindControl({
						control: new(_getControlFactory("TextView", oTypeDescr.mobile))({
							id: oTypeDescr.id,
							width: oTypeDescr.width || undefined
						}),
						property: sProperty,
						propertyType: null,
						formatter: oSelectionFieldFormatter,
						controlProperty: "text",
						typeDescr: oTypeDescr
					});
				}
			}
		},

		/**
		 * Get code control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlTableCode: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlTableCode(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get code for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlTableCode: function(sProperty, oTypeDescr) {
			var sCodeTable = oTypeDescr.codeTable;
			return sap.ui.ino.views.common.ControlFactory._getControlTableCode(sCodeTable, sProperty, oTypeDescr);
		},

		/**
		 * Get value option list control for type description including value property binding
		 *
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getValueControlValueOptionList: function(oTypeDescr) {
			return sap.ui.ino.views.common.ControlFactory.getControlValueOptionList(_getValueProperty(oTypeDescr.dataType), oTypeDescr);
		},

		/**
		 * Get value option list for type description including binding to specified property
		 *
		 * @param sProperty
		 *            Bound property
		 * @param oTypeDescr
		 *            type description
		 * @returns generic UI 5 control
		 */
		getControlValueOptionList: function(sProperty, oTypeDescr) {
			var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oTypeDescr.valueOptionListCode;
			return sap.ui.ino.views.common.ControlFactory._getControlTableCode(sCodeTable, sProperty, oTypeDescr);
		},

		/**
		 * Creates a read-only value text control
		 *
		 * @param sBindingPath
		 *            Binding path used for binding
		 * @param sBindingPrefix
		 *            Binding prefix used for binding
		 * @returns a text view
		 */
		createValueTextControl: function(sBindingPath, sBindingPrefix) {
			sBindingPath = sBindingPath || "";
			sBindingPrefix = sBindingPrefix || "";
			var oTextView = new(_getControlFactory("TextView"))({
				text: sap.ui.ino.views.common.ControlFactory.createValueTextBinding(sBindingPath, sBindingPrefix)
			});
			return oTextView;
		},

		/**
		 * Creates a value text binding
		 *
		 * @param sBindingPath
		 *            Binding path used for binding
		 * @param sBindingPrefix
		 *            Binding prefix used for binding
		 * @returns value text binding
		 */
		createValueTextBinding: function(sBindingPath, sBindingPrefix) {
			sBindingPath = sBindingPath || "";
			sBindingPrefix = sBindingPrefix || "";
			return {
				parts: [{
					path: sBindingPrefix + sBindingPath + "DATATYPE_CODE"
                }, {
					path: sBindingPrefix + sBindingPath + "NUM_VALUE"
                }, {
					path: sBindingPrefix + sBindingPath + "BOOL_VALUE"
                }, {
					path: sBindingPrefix + sBindingPath + "TEXT_VALUE"
                }, {
					path: sBindingPrefix + sBindingPath + "VALUE_OPTION_LIST_CODE"
                }, {
					path: sBindingPrefix + sBindingPath + "UOM_CODE"
                }],
				formatter: sap.ui.ino.views.common.ControlFactory.createValueFormatter()
			};
		},

		/**
		 * Create Value Formatter function
		 *
		 * @returns {Function} Value formatter function
		 */
		createValueFormatter: function() {
			return function(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode) {
				return sap.ui.ino.views.common.ControlFactory.getFormattedValue(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode);
			};
		},

		/**
		 * Get formatted value
		 *
		 * @param sDataType
		 *            Data type
		 * @param fNumValue
		 *            Numeric/Integer Value
		 * @param bBoolValue
		 *            Boolean Value
		 * @param sTextValue
		 *            Text Value
		 * @param sVoLCode
		 *            Value Option List Code
		 * @param sUoMCode
		 *            Unit of Measure Code
		 * @returns {String} Formatted value
		 */
		getFormattedValue: function(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode) {
			var vValue = sap.ui.ino.views.common.ControlFactory.getValue(sDataType, fNumValue, bBoolValue, sTextValue);
			var sFormattedValue = "";
			if (sVoLCode) {
				var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + sVoLCode;
				var vRawValue = sap.ui.ino.views.common.ControlFactory.getRawValue(sDataType, fNumValue, bBoolValue, sTextValue);
				sFormattedValue = sap.ui.ino.models.core.CodeModel.getText(sCodeTable, vRawValue);
			} else {
				switch (sDataType) {
					case "INTEGER":
						sFormattedValue = Math.round(vValue).toString();
						break;
					case "NUMERIC":
						sFormattedValue = (sap.ui.ino.models.formatter.RoundedDecimalFormatter.getFormatter(2)(vValue)).toLocaleString();
						break;
					case "BOOLEAN":
						sFormattedValue = new sap.ui.ino.models.types.StringBooleanType().formatValue(vValue);
						break;
					case "TEXT":
						sFormattedValue = vValue;
						break;
					default:
						sFormattedValue = vValue.toString();
						break;
				}
			}
			if (!sFormattedValue) {
				sFormattedValue = "";
			}
			if (sUoMCode) {
				sFormattedValue = sFormattedValue + " " + sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", sUoMCode);
			}
			return sFormattedValue;
		},

		/**
		 * Get Value according to specified data type
		 *
		 * @param sDataType
		 *            Data type
		 * @param fNumValue
		 *            Numeric/Integer Value
		 * @param bBoolValue
		 *            Boolean Value
		 * @param sTextValue
		 *            Text Value
		 * @returns Value according to specified data type
		 */
		getValue: function(sDataType, fNumValue, bBoolValue, sTextValue) {
			var vValue = null;
			switch (sDataType) {
				case "INTEGER":
					vValue = Math.round(fNumValue);
					break;
				case "NUMERIC":
					vValue = fNumValue;
					break;
				case "BOOLEAN":
					vValue = bBoolValue === 1;
					break;
				case "TEXT":
					vValue = sTextValue;
					break;
			}
			if (isNaN(vValue) || vValue === undefined || vValue === null) {
				switch (sDataType) {
					case "INTEGER":
					case "NUMERIC":
						vValue = 0;
						break;
					case "BOOLEAN":
						vValue = false;
						break;
					case "TEXT":
						vValue = "";
						break;
					default:
						vValue = "";
						break;
				}
			}
			return vValue;
		},

		/**
		 * Get Raw Value according to specified data type
		 *
		 * @param sDataType
		 *            Data type
		 * @param fNumValue
		 *            Numeric/Integer Value
		 * @param bBoolValue
		 *            Boolean Value
		 * @param sTextValue
		 *            Text Value
		 * @returns Value according to specified data type
		 */
		getRawValue: function(sDataType, fNumValue, bBoolValue, sTextValue) {
			var vValue = null;
			switch (sDataType) {
				case "INTEGER":
				case "NUMERIC":
					vValue = fNumValue;
					break;
				case "BOOLEAN":
					vValue = bBoolValue;
					break;
				case "TEXT":
					vValue = sTextValue;
					break;
			}
			if (isNaN(vValue) || vValue === undefined || vValue === null) {
				switch (sDataType) {
					case "INTEGER":
					case "NUMERIC":
					case "BOOLEAN":
						vValue = 0;
						break;
					default:
						vValue = "";
						break;
				}
			}
			return vValue;
		},

		_getControlTableCode: function(sCodeTable, sProperty, oTypeDescr) {
			if (!!oTypeDescr.editable) {
				var oType = sap.ui.ino.views.common.ControlFactory._getTypeForDataType(oTypeDescr);
				var oDropDownBox = sap.ui.ino.views.common.ControlFactory._bindControl({
					control: new(_getControlFactory("DropDownBox", oTypeDescr.mobile))({
						id: oTypeDescr.id,
						editable: !!oTypeDescr.editable,
						enabled: oTypeDescr.editableBinding ? {
							path: oTypeDescr.editableBinding
						} : undefined,
						required: !!oTypeDescr.required,
						width: oTypeDescr.width || undefined
					}),
					property: sProperty,
					propertyType: oType,
					controlProperty: "selectedKey",
					typeDescr: oTypeDescr
				});
				if (oTypeDescr.bindingRef) {
					var aCodes = oTypeDescr.bindingRef.getModel("code").getCodes(sCodeTable, function(oCode) {
						if (oCode.hasOwnProperty("ACTIVE") && oCode.ACTIVE === 0) {
							return false;
						}
						return true;
					});
					oTypeDescr.bindingRef.getModel("code").setProperty("/" + sCodeTable, aCodes);
				}
				var oItemTemplate = new sap.ui.core.ListItem({
					text: {
						path: "code>CODE",
						formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable),
					},
					key: {
						path: "code>CODE",
						type: oType
					},
					tooltip: {
						path: "code>CODE",
						formatter: sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable),
					}
				});
				oDropDownBox.bindItems({
					path: "code>/" + sCodeTable,
					template: oItemTemplate,
					parameters: !!oTypeDescr.includeEmptyCode ? {
						includeEmptyCode: true
					} : undefined
				});
				return oDropDownBox;
			} else {
				if (!!oTypeDescr.link) {
					var oLink = sap.ui.ino.views.common.ControlFactory._bindControl({
						control: new(_getControlFactory("Link", oTypeDescr.mobile))({
							id: oTypeDescr.id,
							href: oTypeDescr.linkHref,
							target: oTypeDescr.linkTarget,
							width: oTypeDescr.width || undefined
						}),
						property: sProperty,
						propertyType: null,
						controlProperty: "text",
						typeDescr: oTypeDescr,
						formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable),
						preventTooltip: true
						// tooltipFormatter : sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable)
					});
					if (oTypeDescr.linkPress) {
						oLink.attachPress(oTypeDescr.linkPress);
					}
					return oLink;
				} else {
					return sap.ui.ino.views.common.ControlFactory._bindControl({
						control: new(_getControlFactory("TextView", oTypeDescr.mobile))({
							id: oTypeDescr.id,
							width: oTypeDescr.width || undefined
						}),
						property: sProperty,
						propertyType: null,
						controlProperty: "text",
						typeDescr: oTypeDescr,
						formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable),
						preventTooltip: true
						// tooltipFormatter : sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable)
					});
				}
			}
		},

		_bindControl: function(oBindingDef) {
			if (typeof oBindingDef.typeDescr.bindingRef === "object") {
				var oBinding = oBindingDef.typeDescr.bindingRef.getBindingInfo(oBindingDef.property).binding;
				if (oBinding) {
					var oBindingContext = oBinding.getContext();
					oBindingDef.control.setModel(oBindingContext.getModel(), "instance");
					oBindingDef.control.setBindingContext(oBindingContext, "instance");
					oBindingDef.control.bindProperty(oBindingDef.controlProperty, {
						path: "instance>" + oBinding.getPath(),
						type: oBindingDef.propertyType,
						formatter: oBindingDef.formatter
					});
					if (!oBindingDef.preventTooltip) {
						sap.ui.ino.views.common.ControlFactory._bindControlTooltip(oBindingDef);
					}
				}
			} else if (typeof oBindingDef.typeDescr.bindingRef === "string") {
				oBindingDef.control.bindProperty(oBindingDef.controlProperty, {
					path: oBindingDef.typeDescr.bindingRef,
					type: oBindingDef.propertyType,
					formatter: oBindingDef.formatter
				});
				if (oBindingDef.typeDescr.model) {
					if (oBindingDef.typeDescr.modelName) {
						oBindingDef.control.setModel(oBindingDef.typeDescr.model, oBindingDef.typeDescr.modelName);
					} else {
						oBindingDef.control.setModel(oBindingDef.typeDescr.model);
					}
				}
				if (!oBindingDef.preventTooltip) {
					sap.ui.ino.views.common.ControlFactory._bindControlTooltip(oBindingDef);
				}
			}
			return oBindingDef.control;
		},

		_bindControlTooltip: function(oBindingDef) {
			if (!oBindingDef.typeDescr.tooltip || !oBindingDef.control.setTooltip) {
				return;
			}
			var oTooltipFormatter = function(oValue) {
				if (oBindingDef.tooltipFormatter) {
					oValue = oBindingDef.tooltipFormatter(oValue);
				}
				return (oBindingDef.typeDescr.tooltipPrefix ? oBindingDef.typeDescr.tooltipPrefix : "") + (oValue ? oValue.toString() : "");
			};
			var sPath = "";
			if (typeof oBindingDef.typeDescr.bindingRef === "object") {
				var oBinding = oBindingDef.typeDescr.bindingRef.getBindingInfo(oBindingDef.property).binding;
				sPath = "instance>" + oBinding.getPath();
			} else if (typeof oBindingDef.typeDescr.bindingRef === "string") {
				sPath = oBindingDef.typeDescr.bindingRef;
			}
			if (oBindingDef.control.getMetadata().getAllProperties()["tooltip"]) {
				oBindingDef.control.bindProperty("tooltip", {
					path: sPath,
					type: oBindingDef.tooltipType,
					formatter: oTooltipFormatter
				});
			} else if (oBindingDef.control.getMetadata().getAllAggregations()["tooltip"]) {
				if (sap.ui.commons) {
					oBindingDef.control.bindProperty("tooltip", {
						path: sPath,
						type: oBindingDef.tooltipType,
						formatter: oTooltipFormatter
					});
				}
			}
		},

		/**
		 * Attach a key press validation for data type INTEGER and NUMERIC to prevent entering other input than numbers
		 *
		 * @param oControl
		 */
		attachKeyPressValidation: function(oControl) {
			if (sap.ui.commons && oControl instanceof sap.ui.commons.TextField && oControl.typeDescr) {
				if (oControl.typeDescr.dataType === "INTEGER" || oControl.typeDescr.dataType === "NUMERIC") {
					var fnKeyPress = function(oControl) {
						jQuery(oControl.getDomRef()).keypress(function(evt) {
							var charCode = (evt.which) ? evt.which : evt.keyCode;
							if ((charCode >= 44 && charCode <= 46) || (charCode >= 48 && charCode <= 57) || charCode == 8) {
								if (oControl.typeDescr.dataType === "NUMERIC") {
									return true;
								} else if (charCode != 44 && charCode != 46) {
									return true;
								}
							}
							return false;
						});
					};
					fnKeyPress(oControl);
				}
			}
		},

		_attachLiveValidation: function(oTextField, oValue, bFinished, bMarkError) {
			var fnControlState = function(sTextKey, aTextParameters, bValueValid) {
				if (bFinished) {
					if (bValueValid) {
						sap.ui.ino.views.common.ControlFactory._bindControlTooltip({
							control: oTextField,
							property: _getValueProperty(oTextField.typeDescr.dataType),
							typeDescr: oTextField.typeDescr
						});

						if (oTextField.typeDescr.validationHandler) {
							oTextField.typeDescr.validationHandler({
								source: oTextField,
								valid: true
							});
						}

						oTextField.setValueState(sap.ui.core.ValueState.None);
					} else {
						oTextField.setTooltip(_getMessageResourceBundle().getText(sTextKey, aTextParameters));
						if (bMarkError) {
							var oMessageParameters = {
								key: sTextKey,
								referenceControl: oTextField,
								level: sap.ui.core.MessageType.Error,
								parameters: aTextParameters,
								group: "validation"
							};

							var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
							sap.ui.ino.models.core.MessageSupport.determineTextByKey(oMessage);

							if (oTextField.typeDescr.validationHandler) {
								oTextField.typeDescr.validationHandler({
									source: oTextField,
									valid: false,
									messages: [oMessage]
								});
							}

							oTextField.setValueState(sap.ui.core.ValueState.Error);
						}
					}
				} else {
					if (bValueValid) {
						oTextField.setValueState(sap.ui.core.ValueState.None);
						jQuery(oTextField.getDomRef()).prop("title", oValue);
					} else {
						if (bMarkError) {
							oTextField.setValueState(sap.ui.core.ValueState.Error);
						}
						jQuery(oTextField.getDomRef()).prop("title", _getMessageResourceBundle().getText(sTextKey, aTextParameters));
					}
				}
			};

			var sTextKey = null;
			var aTextParameters = null;
			var bValueValid = true;

			if (oTextField.typeDescr.dataType === "INTEGER" && oValue.match(/^[-]?\d+$/)) {
				var valueInt = parseInt(oValue);
				if (oTextField.typeDescr.minValue != undefined && oTextField.typeDescr.minValue != null && oTextField.typeDescr.minValue != oTextField
					.typeDescr.maxValue) {
					if (valueInt < oTextField.typeDescr.minValue) {
						sTextKey = "MSG_CONTROL_DATA_TYPE_INVALID_VALUE_INT_GE";
						aTextParameters = [oTextField.typeDescr.minValue];
						bValueValid = false;
					}
				}
				if (oTextField.typeDescr.maxValue != undefined && oTextField.typeDescr.maxValue != null && oTextField.typeDescr.maxValue != oTextField
					.typeDescr.minValue) {
					if (valueInt > oTextField.typeDescr.maxValue) {
						sTextKey = "MSG_CONTROL_DATA_TYPE_INVALID_VALUE_INT_LE";
						aTextParameters = [oTextField.typeDescr.maxValue];
						bValueValid = false;
					}
				}
			} else if (oTextField.typeDescr.dataType === "NUMERIC" && oValue.match(/^[-]?[0-9]+(\,|\.)?[0-9]*$/)) {
				var valueNum = parseFloat(oValue);
				if (oTextField.typeDescr.minValue != undefined && oTextField.typeDescr.minValue != null && oTextField.typeDescr.minValue != oTextField
					.typeDescr.maxValue) {
					if (valueNum < oTextField.typeDescr.minValue) {
						sTextKey = "MSG_CONTROL_DATA_TYPE_INVALID_VALUE_NUM_GE";
						aTextParameters = [oTextField.typeDescr.minValue];
						bValueValid = false;
					}
				}
				if (oTextField.typeDescr.maxValue != undefined && oTextField.typeDescr.maxValue != null && oTextField.typeDescr.maxValue != oTextField
					.typeDescr.minValue) {
					if (valueNum > oTextField.typeDescr.maxValue) {
						sTextKey = "MSG_CONTROL_DATA_TYPE_INVALID_VALUE_NUM_LE";
						aTextParameters = [oTextField.typeDescr.maxValue];
						bValueValid = false;
					}
				}
			} else {
				if (oTextField.typeDescr.dataType === "INTEGER") {
					sTextKey = "MSG_CONTROL_DATA_TYPE_INVALID_VALUE_INT";
					bValueValid = false;
				} else if (oTextField.typeDescr.dataType === "NUMERIC") {
					sTextKey = "MSG_CONTROL_DATA_TYPE_INVALID_VALUE_NUM";
					bValueValid = false;
				} else {
					sTextKey = "MSG_CONTROL_DATA_TYPE_INVALID_VALUE";
					bValueValid = false;
				}
			}

			fnControlState(sTextKey, aTextParameters, bValueValid);
		},

		_getTypeForDataType: function(oTypeDescr) {
			var oType = null;
			if (oTypeDescr.dataType === "INTEGER") {
				oType = new sap.ui.model.type.Integer({
					groupingEnabled: false,
					minFractionDigits: 0,
					maxFractionDigits: 0
				}, {
					minimum: oTypeDescr.minValue != oTypeDescr.maxValue ? oTypeDescr.minValue : undefined,
					maximum: oTypeDescr.maxValue != oTypeDescr.minValue ? oTypeDescr.maxValue : undefined
				});
			} else if (oTypeDescr.dataType === "NUMERIC") {
				oType = new sap.ui.model.type.Float({
					groupingEnabled: false,
					minFractionDigits: 2,
					maxFractionDigits: 2
				}, {
					minimum: oTypeDescr.minValue != oTypeDescr.maxValue ? oTypeDescr.minValue : undefined,
					maximum: oTypeDescr.maxValue != oTypeDescr.minValue ? oTypeDescr.maxValue : undefined
				});
			} else if (oTypeDescr.dataType === "BOOLEAN") {
				oType = new sap.ui.model.type.Integer();
			}
			return oType;
		},

		getAutoCompleteField: function(oSettings) {
			var oAutoCompleteField = new sap.ui.ino.controls.AutoComplete({
				id: oSettings.controlId,
				width: "270px",
				placeholder: oSettings.placeholder,
				maxPopupItems: 10,
				suggest: function(oEvent) {
					// WORKAROUND for strange permanent focus behaviour
					setTimeout(function() {
						if (!jQuery(oAutoCompleteField.getDomRef()).hasClass("sapUiIfFoc")) {
							var oFocusDomRef = jQuery(oAutoCompleteField.getFocusDomRef());
							oFocusDomRef.blur();
							oFocusDomRef.focus();
							jQuery(oAutoCompleteField.getDomRef()).addClass("sapUiTfFoc");
						}
					}, 10);

					var sValue = oEvent.getParameter("suggestValue");
					var oEventSource = oEvent.getSource();

					var oListTemplate = new sap.ui.core.ListItem({
						text: "{NAME}",
						key: "{ID}"
					});

					oEventSource.bindAggregation("items", {
						path: sap.ui.ino.views.common.ObjectInstanceSelection[oSettings.objectInstance].createSearchPath(sValue),
						template: oListTemplate,
						filters: oSettings.fnFilter(),
						parameters: sap.ui.ino.views.common.ObjectInstanceSelection[oSettings.objectInstance].parameters
					});
				},
				confirm: function(oEvent) {
					sap.ui.ino.views.common.ControlFactory._onConfirm(oEvent.getSource(), oSettings.fnExecute);
				}
			}).addStyleClass("sapInoTagFilterMargin");

			var oAddButton = new sap.ui.commons.Button({
				text: "{i18n>BO_COMMON_BUT_ADD}",
				press: function() {
					sap.ui.ino.views.common.ControlFactory._onConfirm(oAutoCompleteField, oSettings.fnExecute);
				}
			}).addStyleClass("sapInoTagFilterMargin");

			return new sap.ui.commons.layout.HorizontalLayout({
				content: [oAutoCompleteField, oAddButton]
			});
		},

		_onConfirm: function(oTextField, fnExecute) {
			var oBinding = oTextField.getBinding("items");

			function equalsCaseInsensitive(sA, sB) {
				return sA && sB && sA.toUpperCase() === sB.toUpperCase();
			}

			var bValidItem = false;
			var iItemId = 0;
			var sItemText = "";

			var sValue = oTextField.getValue();
			oTextField.setValue("");

			var oBindingAvailable = jQuery.Deferred();
			if (oBinding &&
				oBinding.bPendingRequest) {
				oBinding.attachDataReceived(function() {
					oBindingAvailable.resolve();
				});
			} else {
				oBindingAvailable.resolve();
			}

			jQuery.when(oBindingAvailable).done(function() {
				var oSelectedItem = sap.ui.getCore().byId(oTextField.getSelectedItemId());
				if (!oSelectedItem) {
					// second try: user does not select entry but presses enter after binding
					// has been done already. Thus we see wether the typed tag matches one
					// of the items
					var aSelectedItem = jQuery.grep(oTextField.getItems(), function(oItem) {
						return equalsCaseInsensitive(oItem.getText(), sValue);
					});
					oSelectedItem = aSelectedItem && aSelectedItem.length === 1 && aSelectedItem[0];
				}

				if (oSelectedItem) {
					bValidItem = true;
					iItemId = parseInt(oSelectedItem.getKey(), 10);
					sItemText = oSelectedItem.getText();
				}

				fnExecute(bValidItem, iItemId, sItemText);
				oTextField.removeAllItems();
				oTextField.setValue("");
			});
		}
	};
})();