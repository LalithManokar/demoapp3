/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.models.object.Homepagewidget");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.homepagewidget.InnoOfficeHomePageWidget", {
    hasPendingChanges: function() {
        var oViewData = this._oViewModel.getData();
        
        return oViewData.IS_VISIBLE !== this._oOrignalViewData.IS_VISIBLE || oViewData.HTML_CONTENT !== this._oOrignalViewData.HTML_CONTENT;
    },
    
    initPageData: function() {
        this._oViewModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(this._oViewModel, "widget");
        var oDeffered = sap.ui.ino.models.object.Homepagewidget.getBackofficeHomepageWidget();
        oDeffered.done(function(oData) {
            var oWidgetData = oData.RESULT[0] || {IS_VISIBLE: false, HTML_CONTENT: ""};
            oWidgetData.IS_VISIBLE = !!oWidgetData.IS_VISIBLE;
            this._oOrignalViewData = this._cloneData(oWidgetData);
            this._oViewModel.setData(oWidgetData);
            this._oViewModel.attachPropertyChange(this.onViewModelPropertyChange, this);
            
            if (oData.RESULT.length > 0) {
                this.onRefreshPreview();
            }
        }.bind(this));
    },
    
    onRefreshPreview: function() {
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("homepage_preview");

        try {
            var $IFrame = document.getElementsByName("innooffice_homepage_preview");
            if (!$IFrame || $IFrame.length === 0) {
                return;
            }
            var oIFrame = $IFrame[0];
            var fnCreateContent = function() {
                var sContent = this.getView().byId("richTextField").getValue();
                if (!sContent) {
                    return;
                }
                this.validateHTML(sContent);
                oIFrame.contentWindow.createContent([sContent], "innooffice_homepage_preview");
            }.bind(this);
            if (oIFrame.contentWindow.createContent) {
                fnCreateContent();
            } else {
                oIFrame.onload = function() {
                    fnCreateContent();
                };
            }
        } catch(e) {
            var oRewardMessages = new sap.ui.ino.application.Message({
				text: e.toString(),
				key: "innooffice_homepage_preview",
				level: sap.ui.core.MessageType.Error,
				group: "homepage_preview"
			});
			sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages([oRewardMessages]);
        }
    },
    
    onSavePressed: function() {
        var that = this;
        var oViewData = this._oViewModel.getData();
        var oPayload = {
            "WIDGET": {
                "BACKOFFICE_WIDGET": {
                    "TITLE": "",
                    "IS_VISIBLE": oViewData.IS_VISIBLE ? 1 : 0,
                    "HTML_CONTENT": oViewData.HTML_CONTENT,
                    "TYPE_CODE": "BACKOFFICE_WIDGET"
                }
            }
        };
        var oDeffered = sap.ui.ino.models.object.Homepagewidget.updateHomepageWidget(oPayload);
        oDeffered.done(function() {
            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
            var oMessageParameters = {
				key: "MSG_INNOOFFICE_HOMEPAGE_SAVED",
				level: sap.ui.core.MessageType.Success,
				parameters: [],
				group: "homepage_preview",
				text: oMsg.getResourceBundle().getText("MSG_INNOOFFICE_HOMEPAGE_SAVED")
			};
			var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			oApp.removeNotificationMessages("homepage_preview");
            oApp.addNotificationMessage(oMessage);
            
            // disable save button
            that.getView().byId("BUT_SAVE").setEnabled(false);
            that._oOrignalViewData = that._cloneData(that._oViewModel.getData());
        });
        oDeffered.fail(function(oResponse) {
            var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, that.getView(),
				"homepage_preview");
			if (aActionMessages && aActionMessages.length > 0) {
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
			}
        });
    },
    
    validateHTML : function(sContent) {
        // Validate HTML
        var aResult = new jQuery(sContent);
        if (!aResult || aResult.length === 0) {
            throw new Error("Invalid HTML");
        }
    },
    onViewModelPropertyChange: function() {
        var oSaveBtn = this.getView().byId("BUT_SAVE");
        var oViewData = this._oViewModel.getData();
        var bAbleSave = true;
        
        if(!this.hasPendingChanges()) {
            bAbleSave = false;
        } else if (oViewData.IS_VISIBLE && oViewData.HTML_CONTENT.length === 0) {
            bAbleSave = false;
        }
        
        oSaveBtn.setEnabled(bAbleSave);
    },
    _cloneData: function(oTarget) {
        return Object.keys(oTarget).reduce(function(oData, sKey) {
            oData[sKey] = oTarget[sKey];
            return oData;
        }, {});
    },
    _convertPx2Int: function(sPxValue) {
        var aResult = /([0-9]*px)/.exec(sPxValue);
        if (aResult) {
            return parseInt(aResult[1], 10);
        } else {
            return -1;
        }
    }
});