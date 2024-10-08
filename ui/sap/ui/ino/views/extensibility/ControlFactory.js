/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.extensibility.ControlFactory");

jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
jQuery.sap.require("sap.ui.ino.models.core.MetaModel");

jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.views.common.ControlFactory");

(function() {
    "use strict";

    var mDataTypeMapping = {
        "INTEGER" : "INTEGER",
        "DOUBLE" : "NUMERIC",
        "NVARCHAR" : "TEXT",
        "TINYINT" : "BOOLEAN",
        "TIMESTAMP" : "TIMESTAMP",
        "DATE" : "DATE"
    };

    sap.ui.ino.views.extensibility.ControlFactory = {

        /**
         * Settings:
         * 
         * Mandatory: 
         * - object: Application Object  
         * - attribute: Extension Attribute name
         * 
         * Optional: 
         * - colon: Colon after label text 
         * - mobile: Instantiate mobile controls 
         * - bold: Bold design
         */
        createLabel : function(oSettings) {
            var fnControlFactory = !oSettings.mobile ? sap.ui.commons && sap.ui.commons.Label : sap.m && sap.m.Label;
            var sBoldDesign = !oSettings.mobile ? sap.ui.commons && sap.ui.commons.LabelDesign.Bold : sap.m && sap.m.LabelDesign.Bold;
            var oLabel = undefined;
            if (!!oSettings.colon) {
                oLabel = new fnControlFactory({
                    text : {
                        path : "i18n>" + oSettings.object.getObjectName() + "." + oSettings.attribute,
                        formatter : function(vValue) {
                            return vValue + ":";
                        }
                    },
                    design : !!oSettings.bold ? sBoldDesign : undefined
                });
            } else {
                oLabel = new fnControlFactory({
                    text : "{i18n>" + oSettings.object.getObjectName() + "." + oSettings.attribute + "}",
                    design : !!oSettings.bold ? sBoldDesign : undefined
                });
            }
            oLabel.addStyleClass("sapUiLblExt");
            return oLabel;
        },

        /**
         * Creates a control for an extension field according to the specified settings
         * 
         * Settings:
         * 
         * Mandatory: 
         * - object: Application Object 
         * - attribute: Extension Attribute name
         * 
         * Optional: 
         * - id: identifier of the control 
         * - editable: Is the control editable 
         * - model: Model the control is bound to (per default model is inherited from parent context) 
         * - modelName: Name of the model the control is bound to (modelName is "" in read mode, "write" in write mode and "applicationObject" with useAO
         * - absoluteBinding: Defines that attribute bindings are always absolute (read is relative per default) 
         * - link: Control is rendered as link 
         * - linkPress: Event attached to link press 
         * - linkHref: Hyper reference of the link 
         * - linkTarget: Target of the link href 
         * - slider: Defines that the control is rendered as slider for type numeric or integer and with min and max values defined 
         * - tooltip: Tooltip is assigned 
         * - mobile: Instantiate mobile controls 
         * - width: width of the control in px or % 
         * - useAO: Defines that the application object model is used
         */
        createControl : function(oSettings) {
            var oMetadata = sap.ui.ino.models.core.MetaModel.getApplicationObjectMetadata(oSettings.object
                    .getObjectName());

            var oAttributeMetadata = oMetadata.nodes.Extension.attributes[oSettings.attribute];
            if (!oAttributeMetadata) {
                return null;
            }

            var sDataType = mDataTypeMapping[oAttributeMetadata.dataType];
            var bSlider = (oSettings.slider && (sDataType === "NUMERIC" || sDataType === "INTEGER")
                    && oAttributeMetadata.minValue != undefined && oAttributeMetadata.maxValue != undefined) || false;

            var bAbsoluteBinding = !!oSettings.absoluteBinding;
            var sModelName = undefined;
            if (!!oSettings.useAO) {
                bAbsoluteBinding = true;
                sModelName = "applicationObject";
            }
            if (!sModelName) {
                sModelName = oSettings.modelName || (oSettings.editable ? "write" : "");
            }
            var sModelPrefix = "";
            if (sModelName && sModelName != "") {
                sModelPrefix = sModelName + ">";
            }

            var sBindingRef = undefined;
            var sEditableBinding = undefined;
            if (!oSettings.editable) {
                var sAbsolutePrefix = bAbsoluteBinding ? "/" : "";
                sBindingRef = sModelPrefix + sAbsolutePrefix + oSettings.attribute;
            } else {
                sBindingRef = sModelPrefix + "/Extension/0/" + oSettings.attribute;
                sEditableBinding = sModelPrefix + "/property/nodes/Extension/attributes/" + oSettings.attribute
                        + "/changeable";
            }

            var sCodeTable = undefined;
            var sForeignKeyTo = oAttributeMetadata.foreignKeyTo;
            if (sForeignKeyTo) {
                var oSelectionDefinition = sap.ui.ino.views.common.ObjectInstanceSelection.getDefinition(sForeignKeyTo,
                        true);
                if (oSelectionDefinition) {
                    var oForeignKeyToMetadata = sap.ui.ino.models.core.MetaModel
                            .getApplicationObjectMetadata(oSelectionDefinition.name);
                    if (oForeignKeyToMetadata
                            && oForeignKeyToMetadata.type == sap.ui.ino.models.core.ApplicationObject.ObjectType.Configuration) {
                        sCodeTable = oSelectionDefinition.instancePath;
                        sForeignKeyTo = undefined;
                    }
                }
            }
            return sap.ui.ino.views.common.ControlFactory.getControlForType(oSettings.attribute, {
                id : oSettings.id,
                dataType : sDataType,
                bindingRef : sBindingRef,
                model : oSettings.model,
                modelName : sModelName,
                editable : !!oSettings.editable && !!oAttributeMetadata.changeable,
                editableBinding : sEditableBinding,
                valueOptionListCode : oAttributeMetadata.customProperties
                        && oAttributeMetadata.customProperties.valueOptionList,
                codeTable : sCodeTable,
                includeEmptyCode : !oAttributeMetadata.required,
                foreignKeyTo : sForeignKeyTo,
                minValue : oAttributeMetadata.minValue != undefined ? oAttributeMetadata.minValue : undefined,
                maxValue : oAttributeMetadata.maxValue != undefined ? oAttributeMetadata.maxValue : undefined,
                maxLength : oAttributeMetadata.maxLength != undefined ? oAttributeMetadata.maxLength : undefined,
                required : !!oAttributeMetadata.required,
                link : !!oSettings.link,
                linkPress : oSettings.linkPress,
                linkHref : oSettings.linkHref,
                linkTarget : oSettings.linkTarget,
                slider : !!bSlider,
                tooltip : !!oSettings.tooltip && !oSettings.mobile,
                mobile : !!oSettings.mobile,
                width : oSettings.width
            });
        },

        /**
         * Creates a label and a control pair for an extension field according to the specified settings
         * 
         * Settings:
         * 
         * Mandatory: 
         * - object: Application Object 
         * - attribute: Extension Attribute name
         * 
         * Control Optional: 
         * - id: identifier of the control 
         * - editable: Is the control editable 
         * - model: Model the control is bound to (per default model is inherited from parent context) 
         * - modelName: Name of the model the control is bound to (modelName is "" in read mode, "write" in write mode and "applicationObject" in facet 
         * - absoluteBinding: Defines that attribute bindings are always absolute (read is relative per default) 
         * - link: Control is rendered as link 
         * - linkPress: Event attached to link press 
         * - linkHref: Hyper reference of the link 
         * - linkTarget: Target of the link href 
         * - slider: Defines that the control is rendered as slider for type numeric or integer and with min and max values defined 
         * - tooltip: Tooltip is assigned 
         * - mobile: Instantiate mobile controls 
         * - width: width of the control in px or % 
         * - useAO: Defines that the application object model is used
         * 
         * Label Control (Optional): 
         * - colon: Colon after label text 
         * - mobile: Instantiate mobile controls 
         * - bold: Bold design
         */
        createLabelAndControl : function(oSettings) {
            var oPair = {
                control : sap.ui.ino.views.extensibility.ControlFactory.createControl(oSettings),
                label : sap.ui.ino.views.extensibility.ControlFactory.createLabel(oSettings)
            };
            oPair.label.setLabelFor(oPair.control);
            return oPair;
        },

        /**
         * Creates a column control including a template control for an extension field according to the specified
         * settings
         * 
         * Settings:
         * 
         * Mandatory: 
         * - object: Application Object 
         * - attribute: Extension Attribute name
         * 
         * Optional: 
         * - id: Column control identifier 
         * - templateId: Template control identifier 
         * - columnIndex : Index of the column 
         * - sortingEnabled: Sorting on extension attribute enabled (default: true)
         * - filteringEnabled: Filtering on extension attribute enabled (default: true) 
         * - filteredCodes: Array of codes filtered in case of an code table 
         * - tableViews: Array of table views, the column is added to
         * 
         * Label Control (Optional): 
         * - colon: Colon after label text 
         * - mobile: Instantiate mobile controls 
         * - bold: Bold design
         * 
         * Template Control (Optional): 
         * - templateId: Template control identifier 
         * - editable: Is the control editable 
         * - model: Model the control is bound to (per default model is inherited from parent context) 
         * - modelName: Name of the model the control is bound to (modelName is "" in read mode, "write" in write mode and "applicationObject" in facet 
         * - absoluteBinding: Defines that attribute bindings are always absolute (read is relative per default) 
         * - link: Control is rendered as link 
         * - linkPress: Event attached to link press 
         * - linkHref: Hyper reference of the link 
         * - linkTarget: Target of the link href 
         * - slider: Defines that the control is rendered as slider for type numeric or integer and with min and max values defined 
         * - tooltip: Tooltip is assigned 
         * - mobile: Instantiate mobile controls 
         * - width: width of the control in px or % 
         * - useAO: Defines that the application object model is used
         */
        createColumn : function(oSettings) {
            var oMetadata = sap.ui.ino.models.core.MetaModel.getApplicationObjectMetadata(oSettings.object
                    .getObjectName());
            var oAttributeMetadata = oMetadata.nodes.Extension.attributes[oSettings.attribute];
            if (!oAttributeMetadata) {
                return null;
            }
            var oTemplateSettings = jQuery.extend(true, {}, oSettings);
            oTemplateSettings.id = oSettings.templateId;
            delete oTemplateSettings.templateId;

            var oColumn = new sap.ui.table.Column({
                id : oSettings.id,
                label : sap.ui.ino.views.extensibility.ControlFactory.createLabel(oSettings),
                template : sap.ui.ino.views.extensibility.ControlFactory.createControl(oTemplateSettings),
                filterProperty : oSettings.filteringEnabled === undefined || oSettings.filteringEnabled === true
                        ? oSettings.attribute
                        : undefined,
                sortProperty : oSettings.sortingEnabled === undefined || oSettings.sortingEnabled === true
                        ? oSettings.attribute
                        : undefined,
            });

            var sCodeTable = undefined;
            if (oAttributeMetadata.customProperties && oAttributeMetadata.customProperties.codeTable) {
                sCodeTable = oAttributeMetadata.customProperties.codeTable;
            } else if (oAttributeMetadata.customProperties && oAttributeMetadata.customProperties.valueOptionList) {
                sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_"
                        + oAttributeMetadata.customProperties.valueOptionList;
            }
            oColumn.addCustomData(new sap.ui.core.CustomData({
                key : "isExtension",
                value : true
            }));
            oColumn.addCustomData(new sap.ui.core.CustomData({
                key : "columnName",
                value : oSettings.attribute
            }));
            oColumn.addCustomData(new sap.ui.core.CustomData({
                key : "columnIndex",
                value : oSettings.columnIndex != undefined ? oSettings.columnIndex : undefined
            }));
            oColumn.addCustomData(new sap.ui.core.CustomData({
                key : "filteringEnabled",
                value : oSettings.filteringEnabled === undefined || oSettings.filteringEnabled === true
            }));
            oColumn.addCustomData(new sap.ui.core.CustomData({
                key : "filteredCodes",
                value : oAttributeMetadata.filteredCodes
            }));
            oColumn.addCustomData(new sap.ui.core.CustomData({
                key : "codeTable",
                value : sCodeTable
            }));
            oColumn.addCustomData(new sap.ui.core.CustomData({
                key : "tableViews",
                value : oSettings.tableViews
            }));
            return oColumn;
        }
    };
})();