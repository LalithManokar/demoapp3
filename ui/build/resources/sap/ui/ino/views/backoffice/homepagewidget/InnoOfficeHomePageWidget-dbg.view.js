/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.homepagewidget.InnoOfficeHomePageWidget", jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {
    init: function() {
        this.initMessageSupportView();
        this.getController().initPageData();
    },

    exit: function() {
        this.exitMessageSupportView();
        sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
    },
    
    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.homepagewidget.InnoOfficeHomePageWidget";
    },
    
    hasPendingChanges : function() {
        return this.getController().hasPendingChanges();
    },
    
    createContent: function() {
        
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 4,
            widths : ["20%", "20px", "949px", "auto"]
        });
        
        this.addSaveButton(oLayout);
        this.addEnableCheckbox(oLayout);
        this.addSegmentTab(oLayout);
        this.addWidgetContent(oLayout);
        this.addRefreshPreviewButton(oLayout);
        this.addPreviewTitleText(oLayout);
        this.addPreview(oLayout);
        return oLayout;
    },
    addSaveButton: function(oLayout) {
        var oController = this.getController();
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        this.oSaveButton = new sap.ui.commons.Button({
            id : this.createId("BUT_SAVE"),
            text : "{i18n>BO_HOME_PAGE_WIDGET_BUT_SAVE}",
            press : [oController.onSavePressed, oController],
            colSpan: 3,
            lite : false,
            enabled : false
        });
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content : [this.oSaveButton]
        });
        oRow.addCell(oCell);
        oLayout.addRow(oRow);
    },
    addEnableCheckbox: function(oLayout) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        var oCell;
        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content : [new sap.ui.commons.Label({
                text: "{i18n>BO_HOME_PAGE_WIDGET_CHECKBOX_ENABLEd}",
                design: sap.ui.commons.TextViewDesign.Bold,
    			textAlign: sap.ui.core.TextAlign.Right,
    			width: "100%"
            })]
        });
        oRow.addCell(oCell);
        
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        
        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [new sap.ui.commons.CheckBox({
                checked: "{widget>/IS_VISIBLE}"
            })]
        });
        oRow.addCell(oCell);

        oLayout.addRow(oRow);
    },
    addSegmentTab: function(oLayout) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        var oCell, that = this;
        
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        
        var oMenuVisualizedButton = new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>BO_HOME_PAGE_WIDGET_SEGMENTED_VISUALIZED}",
            text : "{i18n>BO_HOME_PAGE_WIDGET_SEGMENTED_VISUALIZED}"
        });
        var oMenuExpertButton = new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>BO_HOME_PAGE_WIDGET_SEGMENTED_EXPERT}",
            text : "{i18n>BO_HOME_PAGE_WIDGET_SEGMENTED_EXPERT}"
        });
        var oMenuButton = new sap.ui.commons.SegmentedButton({
            buttons: [oMenuVisualizedButton, oMenuExpertButton],
            selectedButton: oMenuVisualizedButton,
            select: function(oEvent) {
                var sButId = oEvent.getParameter("selectedButtonId");
                that.byId("richTextField").setVisible(sButId === oMenuVisualizedButton.getId());
				that.byId("richTextExpertField").setVisible(sButId === oMenuExpertButton.getId());
            }
        });
        
        oCell =  new sap.ui.commons.layout.MatrixLayoutCell({
            content: [oMenuButton]
        });
        oRow.addCell(oCell);
        
        oLayout.addRow(oRow);
    },
    addWidgetContent: function(oLayout) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        var oCell, oLabel, oRichEditorCell;

        oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_HOME_PAGE_WIDGET_CONTENT_LABEL}",
			design: sap.ui.commons.TextViewDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			required: true,
			width: "100%"
		});
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [oLabel]
        });
        oRow.addCell(oCell);
        
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        
        oRichEditorCell = new sap.ui.commons.layout.MatrixLayoutCell({});
        oRow.addCell(oRichEditorCell);
        
        setTimeout(function() {
            var oRichTextEditor = this.getRichTextEditor();
            oRichEditorCell.addContent(oRichTextEditor);
            var oRichTextEditorExpertField = this.getRichTextEditorExpertField();
            oRichTextEditorExpertField.setVisible(false);
            oRichEditorCell.addContent(oRichTextEditorExpertField);
        }.bind(this), 500);//bIsMSIE ? 500 : 0);
        
        oLayout.addRow(oRow);
    },
    addRefreshPreviewButton: function(oLayout) {
        var oController = this.getController();
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [new sap.ui.commons.Button({
                id : this.createId("BUT_REFRESH_PREVIEW"),
                text : "{i18n>BO_HOME_PAGE_WIDGET_PREVIEW_REFRESH_BUTTON}",
                press : [oController.onRefreshPreview, oController],
                lite : false
            })]
        });
        
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        oRow.addCell(oCell);
        
        oLayout.addRow(oRow);
    },
    addPreviewTitleText: function(oLayout) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [new sap.ui.commons.TextView({
                text : "{i18n>BO_HOME_PAGE_WIDGET_PREVIEW_TITLE}"
            })]
        });
        
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        oRow.addCell(oCell);
        
        oLayout.addRow(oRow);
    },
    addPreview: function(oLayout) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        var oCell, oLabel, oPreviewCell, that = this;
		var sUrl = sap.ui.ino.application.Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_UI_INNOOFFICE_HOMEPAGE_PREVIEW");
		var sContent = "<div style='width: 100%'></div>";
		
		 oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_HOME_PAGE_WIDGET_PREVIEW_LABEL}",
			design: sap.ui.commons.TextViewDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [oLabel]
        });
        oRow.addCell(oCell);
        
        oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        
        oPreviewCell = new sap.ui.commons.layout.MatrixLayoutCell();
        if (sUrl) {
            sContent = "<div style='width: 100%'><iframe name='innooffice_homepage_preview' src='" + sUrl + 
                "' width='100%' height='100%' style='border:0'></iframe></div>";
        }
        oPreviewCell.addContent(new sap.ui.core.HTML({
			content: sContent,
			sanitizeContent: true,
			afterRendering: function() {
			    var oController = that.getController();
			    if (oController._oViewModel && 
			        oController._oViewModel.getData().HTML_CONTENT && 
			        oController._oViewModel.getData().HTML_CONTENT.length > 0) {
			        oController.onRefreshPreview();
			    }
			}
		}));
        oRow.addCell(oPreviewCell);
        
        oLayout.addRow(oRow);
    },
    getRichTextEditor: function() {
        var oRichTextField = sap.ui.ino.application.ControlFactory.createRichTextEditor(
            this.createId("richTextField"), 
            "widget>/HTML_CONTENT", 
            "600px",
		    true,
		    undefined,
		    undefined,
		    "HOME_PAGE_WIDGET"
		);
		oRichTextField.attachReady(function(oEvent) {
		    oEvent.getSource().setHeight("600px");
		});
		return oRichTextField;
    },
    getRichTextEditorExpertField: function() {
        return new sap.ui.commons.TextArea({
		    id: this.createId("richTextExpertField"), 
			value: "{widget>/HTML_CONTENT}",
			height: "600px",
			width: "100%"
		});
    }
}));