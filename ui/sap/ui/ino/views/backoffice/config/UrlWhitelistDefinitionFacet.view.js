/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.models.types.IntegerNullableType");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.UrlWhitelistDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.UrlWhitelistDefinitionFacet";
    },
    
    createFacetContent: function() {
		var bEdit = this.getController().isInEditMode();
		var oGroupGeneral = this.createLayoutGeneral(bEdit);
		var oGroupCriterions = this.createLayoutDetails(bEdit);

		return [oGroupGeneral, oGroupCriterions];
	},

    createLayoutGeneral : function(bEdit) {

        var oLayoutGeneral = new sap.ui.commons.layout.MatrixLayout({
            columns : 4,
            widths : ['100px', '150px', '100px', '40%']
        });

        var oNameLabel = this.createControl({
            Type : "label",
            Text : "BO_URL_WHITELIST_FLD_DEFAULT_TEXT",
            Tooltip : "BO_URL_WHITELIST_FLD_DEFAULT_TEXT"
        });
        var oNameField = this.createControl({
            Type : "textfield",
            Text : "/DEFAULT_TEXT",
            Editable : bEdit,
            LabelControl : oNameLabel
        });

        var oDescriptionLabel = this.createControl({
            Type : "label",
            Text : "BO_URL_WHITELIST_FLD_DEFAULT_LONG_TEXT",
            Tooltip : "BO_URL_WHITELIST_FLD_DEFAULT_LONG_TEXT"
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
        oLayoutGeneral.addRow(oRow);

        var oCodeLabel = this.createControl({
            Type : "label",
            Text : "BO_URL_WHITELIST_FLD_PLAIN_CODE",
            Tooltip : "BO_URL_WHITELIST_FLD_PLAIN_CODE"
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
        oLayoutGeneral.addRow(oRow);
        
		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_URL_WHITELIST_GENERAL_INFO_TIT"),
			content: [oLayoutGeneral, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
    },    
    
    createLayoutDetails : function(bEdit) { 
	
		var oLayoutDetails = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['200px', '200px', '100px', '40%']
		});

		this.oDetail = oLayoutDetails;  
        
        var oProtocolLabel = this.createControl({
            Type : "label",
            Text : "BO_URL_WHITELIST_FLD_PROTOCOL",
            Tooltip : "BO_URL_WHITELIST_FLD_PROTOCOL"
        });
        var oProtocolField = this.createControl({
            Type : "textfield",
            Text : "/PROTOCOL",
            Editable : bEdit,
            LabelControl : oProtocolLabel
        });

        var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oProtocolLabel,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oProtocolField,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
        oLayoutDetails.addRow(oRow);
        
        var oHostLabel = this.createControl({
            Type : "label",
            Text : "BO_URL_WHITELIST_FLD_HOST",
            Tooltip : "BO_URL_WHITELIST_FLD_HOST"
        });
        var oHostField = this.createControl({
            Type : "textfield",
            Text : "/HOST",
            Editable : bEdit,
            LabelControl : oHostLabel
        });
        
        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oHostLabel,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oHostField,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
        oLayoutDetails.addRow(oRow);
        
        var oPortLabel = this.createControl({
            Type : "label",
            Text : "BO_URL_WHITELIST_FLD_PORT",
            Tooltip : "BO_URL_WHITELIST_FLD_PORT"
        });
        var oPortField = this.createControl({
            Type : "textfield",
            DataType: new sap.ui.ino.models.types.IntegerNullableType(), 
            Text : "/PORT",
            Editable : bEdit,
            LabelControl : oPortLabel
        });

        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oPortLabel,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oPortField,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
        oLayoutDetails.addRow(oRow);
        
        var oPathLabel = this.createControl({
            Type : "label",
            Text : "BO_URL_WHITELIST_FLD_PATH",
            Tooltip : "BO_URL_WHITELIST_FLD_PATH"
        });
        var oPathField = this.createControl({
            Type : "textfield",
            Text : "/PATH",
            Editable : bEdit,
            LabelControl : oPathLabel
        });
        
        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oPathLabel,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oPathField,
                vAlign : sap.ui.commons.layout.VAlign.Center,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
        oLayoutDetails.addRow(oRow);
        
		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_URL_WHITELIST_DETAIL_INFO_TIT"),
			content: [oLayoutDetails, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});  
    }

}));