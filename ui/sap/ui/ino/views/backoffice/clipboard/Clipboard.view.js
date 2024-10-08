/*!
 * @copyright@
 */

jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.clipboard.Clipboard", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.clipboard.Clipboard";
    },

    createContent : function(oController) {
        var _i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

        var oInstance = new sap.ui.commons.Link({
            text : "{clipboard>name}",
            press : [oController.open, oController],
            width : "100%"
        }).addStyleClass("sapUiInoClipboardEntryLink");

        var oEntryTemplate = new sap.ui.commons.layout.HorizontalLayout({
            content : [oInstance, new sap.ui.commons.Button({
                tooltip : "{i18n>BO_APPLICATION_BUT_CLIPBOARD_REMOVE_TIT}",
                press : [oController.onRemoveInstance, oController],
                lite : true
            }).addStyleClass("sapUiInoClipboardBtn")]
        }).addStyleClass("sapUiInoClipboardEntry");

        var oObject = new sap.ui.commons.AccordionSection({
            title : {
                path : "clipboard>name",
                formatter : function(sObjectName) {
                    return sObjectName ? _i18n.getText("CLIPBOARD_OBJECT_NAME_" + sObjectName) : "";
                }
            },
            content : {
                templateShareable : true,
                path : "clipboard>entry",
                template : oEntryTemplate
            }
        });

        var oClipboard = new sap.ui.commons.Accordion({
            width : "100%",
            sections : {
                path : "clipboard>/object",
                template : oObject
            }
        }).addStyleClass("sapUiInoClipboard");

        var oRemoveAllButton = new sap.ui.commons.Button({
            press : [oController.onRemoveAll, oController],
            text : "{i18n>BO_APPLICATION_BUT_CLIPBOARD_REMOVE_ALL}",
            tooltip : "{i18n>BO_APPLICATION_BUT_CLIPBOARD_REMOVE_ALL_TIT}",
            enabled : {
                path : "clipboard>/isEmpty",
                formatter : sap.ui.ino.models.core.ClipboardModel.getSharedClipboardNotEmptyFormatter()
            },
            lite : true
        });

        var oToolbar = new sap.ui.commons.Toolbar({
            items : [oRemoveAllButton]
        }).addStyleClass("sapUiInoClipboardToolbar");

        var oClipboardDescription = new sap.ui.core.HTML({
            content : "{i18n>BO_APPLICATION_INS_CLIPBOARD_DESCR}",
            sanitizeContent : true
        });

        this.oPanel = new sap.ui.commons.Panel({
            text : "{i18n>BO_APPLICATION_MIT_CLIPBOARD}",
            showCollapseIcon : false,
            content : [oToolbar, oClipboard, oClipboardDescription]
        });
        
        this.oPanel.addStyleClass("sapUiInoHelpPanel");

        return this.oPanel;
    }
});