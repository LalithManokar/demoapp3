/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.UnitDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.UnitDefinitionFacet";
    },

    createFacetContent : function(oController) {
        var bEdit = oController.isInEditMode();

        var oUnitLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 4,
            widths : ['100px', '150px', '100px', '40%']
        });

        var oNameLabel = this.createControl({
            Type : "label",
            Text : "BO_UNIT_FLD_DEFAULT_TEXT",
            Tooltip : "BO_UNIT_FLD_DEFAULT_TEXT"
        });
        var oNameField = this.createControl({
            Type : "textfield",
            Text : "/DEFAULT_TEXT",
            Editable : bEdit,
            LabelControl : oNameLabel
        });

        var oDescriptionLabel = this.createControl({
            Type : "label",
            Text : "BO_UNIT_FLD_DEFAULT_LONG_TEXT",
            Tooltip : "BO_UNIT_FLD_DEFAULT_LONG_TEXT"
        });
        var oDescriptionField = this.createControl({
            Type : "textarea",
            Text : "/DEFAULT_LONG_TEXT",
            Editable : bEdit,
            LabelControl : oDescriptionLabel
        });

        var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oNameLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oNameField,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oDescriptionLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Center,
                rowSpan : 2
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oDescriptionField,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                rowSpan : 2
            })]
        });
        oUnitLayout.addRow(oRow);

        var oCodeLabel = this.createControl({
            Type : "label",
            Text : "BO_UNIT_FLD_PLAIN_CODE",
            Tooltip : "BO_UNIT_FLD_PLAIN_CODE"
        });

        var oCodeField = this.createControl({
            Type : "textfield",
            Text : "/PLAIN_CODE",
            Editable : bEdit,
            LabelControl : oCodeLabel
        });
        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oCodeLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oCodeField,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
        oUnitLayout.addRow(oRow);

        var oGroup = new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_UNIT_TIT_GENERAL_INFO"),
            content : [oUnitLayout, new sap.ui.core.HTML({
                content : "<br/>",
                sanitizeContent : true
            })],
            colspan : true
        });

        return [oGroup];
    },

}));