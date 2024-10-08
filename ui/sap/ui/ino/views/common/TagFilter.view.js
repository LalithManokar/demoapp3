/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.controls.Repeater");
jQuery.sap.require("sap.ui.ino.views.common.ControlFactory");
var ControlFactory = sap.ui.ino.views.common.ControlFactory;

sap.ui.jsview("sap.ui.ino.views.common.TagFilter", jQuery.extend({},
        sap.ui.ino.views.common.MessageSupportView, {

    init : function() {
        this.initMessageSupportView();
    },

    exit : function() {
        this.exitMessageSupportView();
        sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
    },

    getControllerName : function() {
        return "sap.ui.ino.views.common.TagFilter";
    },

    createContent : function() {
        var oController = this.getController();
        var oViewData = this.getViewData();

        var fnExecute = function() {
            return oController.addTag.apply(oController, arguments);
        };

        var fnSelectedTagFilter = function() {
        	return oController.getSelectedTagsFilter();
        };
        
        var oSettings = {
            controlId : this.createId("tagtextfield"),
            placeholder : oViewData.placeholder || "{i18n>BO_COMMON_INS_FILTERTAGS}",
            objectInstance : oViewData.objectInstance,
            fnExecute : fnExecute,
            fnFilter : fnSelectedTagFilter
        };
        
        var oAutoComplete = ControlFactory.getAutoCompleteField(oSettings);

        var oAddFromClipboardButton = new sap.ui.commons.Button({
            id : this.createId("clipboardtagsbutton"),
            text : "{i18n>BO_COMMON_BUT_ADD_FROM_CLIPBOARD}",
            press : function() {
                oController.addTagFromClipboard();
            },
            enabled : {
                path : "clipboard>/changed",
                formatter : function() {
                    var bEmpty = sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Tag);
                    return !bEmpty;
                }
            }
        }).addStyleClass("sapInoTagFilterMargin");

        var oTagRepeater = this.createTagRepeater();
        oTagRepeater.addStyleClass("sapInoTagFilterMargin");

        var oHLayout = new sap.ui.commons.layout.HorizontalLayout({
            content : [oAutoComplete, oAddFromClipboardButton, oTagRepeater]
        }).addStyleClass("sapInoWhiteSpaceNormal");

        oHLayout.addStyleClass("sapInoTagFilterView");
        
        return oHLayout;
    },

    createTagRepeater : function() {
        var oRepeater = new sap.ui.ino.controls.Repeater({
            id : this.createId("tagrepeater"),
            floatHorizontal : true,
            floatHorizontalSeparatorControl : new sap.ui.commons.Label({
                text : "   "
            })
        });

        return oRepeater;
    },

    attachChange : function() {
        var aArgs = ["change"];
        aArgs = aArgs.concat(jQuery.makeArray(arguments));
        this.attachEvent.apply(this, aArgs);
    }
}));