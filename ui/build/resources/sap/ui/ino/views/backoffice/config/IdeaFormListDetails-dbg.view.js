/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.IdeaFormListDetails", {
    getControllerName : function(){
        return "sap.ui.ino.views.backoffice.config.IdeaFormListDetails";
    },
    setRowContext : function(oBindingContext){
        if(!oBindingContext){
            return;
        }
        
        var iID = oBindingContext.getProperty('ID');
        var sKey = "StagingIdeaForm(" + iID + ")";
        
        sap.ui.ino.models.core.InvalidationManager.validateEntity(sKey);
        
        var sPath = "/" + sKey;
        
        this.bindElement(sPath);
        
        sPath = sPath + "/Fields";
        
        // the subview needs a named model, we make sure to set it here and get the path correctly
        var sPrefix = this.oFieldDetailView.getController().getModelPrefix();
        var sModelName = this.oFieldDetailView.getController().getModelName();

        // make sure the model is set
        var oModel = this.getModel(sModelName);
        if (!oModel) {
            this.setModel(this.getModel(), sModelName);
        }

        sPath = sPrefix + sPath;

        var oBinding = {
            path : sPath,
            sorter : [new sap.ui.model.Sorter("SEQUENCE_NO")]
        };

        this.oFieldDetailView.setFieldsBinding(oBinding);
        
    },
    
    createContent : function(){
        var oPanel = new sap.ui.commons.Panel({
            showCollapseIcon : false,
            areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
            borderDesign : sap.ui.commons.enums.BorderDesign.None,
            text : "{i18n>BO_IDEA_FORM_ADMINISTRATION_LIST_DETAILS_HEADER}"
        });

        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 3,
            width : '100%',
            widths : ['33%', '33%', '34%']
        });

        var oRow = this.createIdeaFormDetailRow();
        oLayout.addRow(oRow);

        oRow = this.createIdeaFormFieldsRow();
        oLayout.addRow(oRow);
        
        oPanel.addContent(oLayout);

        return oPanel;        
    },
    createIdeaFormDetailRow : function(){
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        var oContent = this.createIdeaFormDetailRowLeft();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        oContent = this.createIdeaFormDetailRowMiddle();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        oContent = this.createIdeaFormDetailRowRight();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        return oRow;        
    },
    
    createIdeaFormDetailRowLeft : function(){
            var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_IDEA_FORM_ADMINISTRATION_FLD_TEXT}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var bEdit = this.getController().isInEditMode();
        var oText = null;
        if (bEdit) {
            oText = new sap.ui.ino.controls.TextView({
                text : "{PLAIN_CODE}"
            });
        } else {
            oText = new sap.ui.ino.controls.TextView({
                text : {
                    path : "CODE",
                    formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                }
            });
        }
        
        oLabel.setLabelFor(oText);

        oLayout.createRow(oLabel, oText);

        return oLayout;
    },
    
    createIdeaFormDetailRowMiddle : function(){
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_IDEA_FORM_ADMINISTRATION_FLD_CHANGED_AT}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var oText = new sap.ui.ino.controls.TextView({
            text : {
                path : "CREATED_AT",
                type : new sap.ui.model.type.Date()
            }
        });
        
        oLabel.setLabelFor(oText);

        oLayout.createRow(oLabel, oText);

        return oLayout;        
    },
    createIdeaFormDetailRowRight : function(){
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_IDEA_FORM_ADMINISTRATION_FLD_CHANGED_BY}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var oLink = new sap.ui.commons.Link({
            text : "{CREATED_BY}",
            press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
        });
        
        oLabel.setLabelFor(oLink);

        oLayout.createRow(oLabel, oLink);
        
        return oLayout;        
    },
    
    createIdeaFormFieldsRow : function(){
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            colSpan : 3
        });

        this.oFieldDetailView = sap.ui.view({
            viewName : "sap.ui.ino.views.backoffice.config.IdeaFormListDetail",
            type : sap.ui.core.mvc.ViewType.JS,
            viewData : {
                parentView : this,
                includeToolbar : true
            }
        });
        oCell.addContent(this.oFieldDetailView);

        oRow.addCell(oCell);

        return oRow;
    }
});