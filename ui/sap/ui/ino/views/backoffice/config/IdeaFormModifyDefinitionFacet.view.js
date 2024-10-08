/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.IdeaFormModifyDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
    getControllerName : function(){
        return "sap.ui.ino.views.backoffice.config.IdeaFormModifyDefinitionFacet";
    },
    createFacetContent : function(){
        var bEdit = this.getController().isInEditMode();
        var oGroupGeneral = this.createLayoutGeneral(bEdit);
        var oGroupCriterions = this.createLayoutFields(bEdit);

        return [oGroupGeneral, oGroupCriterions];
    },
    
    createLayoutGeneral : function(bEdit){
        var oContent = new sap.ui.commons.layout.MatrixLayout({
            columns : 4,
            widths : ['100px', '150px', '100px', '40%']
        });

        var oCodeText = this.createControl({
            Type : "textfield",
            Node : "Root",
            Text : "/PLAIN_CODE",
            Editable : bEdit
        });

        var oDescriptionText = this.createControl({
            Type : "textarea",
            Node : "Root",
            Text : "/DEFAULT_LONG_TEXT",
            Editable : bEdit
        });

        var oNameText = this.createControl({
            Type : "textfield",
            Node : "Root",
            Text : "/DEFAULT_TEXT",
            Editable : bEdit
        });
        var oIsAdminFormCheckBox = this.createControl({
            Type : "checkbox",
            Node : "Root",
            Text : "/IS_ADMIN_FORM",
            Editable : bEdit,
            onChange: function(oEvent){this.getController().onIsAdminFormChange(oEvent);}
        });
        var oRow1 = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : this.createControl({
                    Type : "label",
                    Text : "BO_IDEA_FORM_ADMINISTRATION_FLD_DEFAULT_TEXT",
                    LabelControl : oNameText
                }),
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oNameText,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : this.createControl({
                    Type : "label",
                    Text : "BO_IDEA_FORM_ADMINISTRATION_FLD_DEFAULT_LONG_TEXT",
                    LabelControl : oDescriptionText
                }),
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Center,
                rowSpan : 2
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oDescriptionText,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                rowSpan : 2
            })]
        });
        oContent.addRow(oRow1);

        var oRow2 = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : this.createControl({
                    Type : "label",
                    Text : "BO_IDEA_FORM_ADMINISTRATION_FLD_PLAIN_CODE",
                    LabelControl : oCodeText
                }),
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oCodeText,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
        oContent.addRow(oRow2);
        ///Admin form setting
        var oRow3 = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : this.createControl({
                    Type : "label",
                    Text : "BO_IDEA_FORM_ADMINISTRATION_FLD_IS_ADMIN_FORM",
                    LabelControl : oIsAdminFormCheckBox
                }),
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oIsAdminFormCheckBox,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
        oContent.addRow(oRow3);
        
        return new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_IDEA_FORM_ADMINISTRATION_GENERAL_INFO_TIT"),
            content : [oContent, new sap.ui.core.HTML({
                content : "<br/>",
                sanitizeContent : true
            })],
            colspan : true
        });        
    },
    
    createLayoutFields  : function(){
        
        this.oFieldsDetailView = sap.ui.view({
            viewName    : "sap.ui.ino.views.backoffice.config.IdeaFormListDetail",
            type        : sap.ui.core.mvc.ViewType.JS,
            viewData    : {
                parentView : this,
                includeToolbar : true
            } 
        });
        
        this.oFieldsDetailView.facetView = this;

        var oBinding = {
            path : this.getFormatterPath("Fields", true),
            sorter : [new sap.ui.model.Sorter("SEQUENCE_NO")]
        };

        this.oFieldsDetailView.setFieldsBinding(oBinding);

        return new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_IDEA_FORM_ADMINISTRATION_FIELD_TIT"),
            content : [this.oFieldsDetailView, new sap.ui.core.HTML({
                content : "<br/>",
                sanitizeContent : true
            })],
            colspan : true
        }); 
    },
    
    revalidateMessages : function() {
        this.oFieldsDetailView.revalidateMessages();
        // super call
        sap.ui.ino.views.common.FacetAOView.revalidateMessages.apply(this, arguments);
    }
}));