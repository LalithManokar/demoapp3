/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.controller("sap.ui.ino.views.backoffice.ExpertFinder", {

    iLimitExperts : 100,
    iMinLimitExperts : 300,

    sInvolvedPersonsModelName : "involvedPersons",
    sExpertModelName : "expert",

    onInit : function() {
        var oView = this.getView();
        this._involvedPersons = [];
        this._involvedPersonsModel = new sap.ui.model.json.JSONModel(this._involvedPersons);
        oView.setModel(this._involvedPersonsModel, this.sInvolvedPersonsModelName);
        this._expertModel = new sap.ui.model.json.JSONModel();
        oView.setModel(this._expertModel, this.sExpertModelName);
    },

    onExit : function() {
        var oView = this.getView();
        var oCore = sap.ui.getCore();

        var oExpertPanel = oCore.byId(oView.createId("expertPanel"));
        var oExpertGraph = oCore.byId(oView.createId("expertGraph"));
        var oExpertTable = oCore.byId(oView.createId("expertTableLayout"));

        if (oExpertPanel) {
            oExpertPanel.destroy();
        }
        if (oExpertGraph) {
            oExpertGraph.destroy();
        }
        if (oExpertTable) {
            oExpertTable.destroy();
        }
    },

    rerenderData : function() {
        var oView = this.getView();
        var oCore = sap.ui.getCore();
        var oExpertPanel = oCore.byId(oView.createId("expertPanel"));
        //working with a styleclass instead of the visible flag will prevent rerendering (-> flickering graph)
        oExpertPanel.addStyleClass("sapUiInoDisplayNone");
        var oExpertGraph = oCore.byId(oView.createId("expertGraph"));
        oExpertGraph.setExperts(this._involvedPersons);
        var oExpertTable = oCore.byId(oView.createId("expertTable"));
        oExpertTable.clearSelection();
        if (!oExpertTable.getBindingInfo("rows") || oExpertTable.getBindingInfo("rows").model !== this.sInvolvedPersonsModelName) {
            // should never happen
            oExpertTable.bindRows(this.sInvolvedPersonsModelName + ">/");
        }
        this.oView.rerender();
    },

    createPercentString : function(fFloat) {
        var percent = fFloat * 100.0;

        if(percent < 0.01) {
            return "< 0.01 %";
        }
        return percent.toFixed(2) + " %";
    },

    setInvolvedPersons : function(involvedPersons) {
        jQuery.map(involvedPersons, function(n) {
            var tags = [];

            jQuery.each(n.CORRELATION, function(index, correlation) {
                var currentTag = correlation.TAG.NAME;
                if(jQuery.inArray(currentTag, tags) === -1) {
                    tags.push(currentTag);
                }
            });

            n.TAGS = tags.shift();
            jQuery.each(tags, function(index, tag) {
                n.TAGS += ", " + tag;
            });            
        });
        this._involvedPersons = involvedPersons;
        this._involvedPersonsModel.setData(this._involvedPersons);
    },

    getExperts : function(aSelectedTags) {
        if (aSelectedTags.length !== 0) {
            var that = this;
            var iLimit = Math.max(this.iLimitExperts * aSelectedTags.length, this.iMinLimitExperts); 
            var conString = "?TOP=" + iLimit;

            jQuery.each(aSelectedTags, function(index, currentTag) {
                conString += "&TAG=" + currentTag.NAME;
            });
            
            sap.ui.ino.controls.BusyIndicator.show(0);

            jQuery.ajax({
                url : Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/experts.xsjs" + conString,
                success : function(oData) {
                    sap.ui.ino.controls.BusyIndicator.hide();

                    that.setInvolvedPersons(oData);
                    that.rerenderData();

                    if (oData.length === iLimit) {
                        that.setMessage(sap.ui.core.MessageType.Info, "MSG_EXPERTFINDER_RESULT_LIMITED", [iLimit]);
                    }
                },
                error : function() {
                    sap.ui.ino.controls.BusyIndicator.hide();

                    that.setMessage(sap.ui.core.MessageType.Error, "MSG_EXPERTFINDER_FLD_LOAD_FAILED");
                }
            });
        } else {
            this._involvedPersons = [];
            this._involvedPersonsModel.setData(this._involvedPersons);
            this.rerenderData();
        }
    },

    updateInvolvedPersons : function(oTagId){
        var aNewPersons = [];
        jQuery.each(this._involvedPersons, function(index, oCurrentPerson) {
            var oResult = jQuery.grep(oCurrentPerson.CORRELATION, function(e) {
                return e.TAG.ID !== oTagId;
            });

            if (oResult.length !== 0) {
                aNewPersons.push(oCurrentPerson);
                aNewPersons[aNewPersons.length - 1].CORRELATION = oResult;
            }
        });

        this.setInvolvedPersons(aNewPersons);
    },

    selectGraphView : function() {
        var oCore = sap.ui.getCore();
        var oView = this.getView();
        var oExpertPanel = oCore.byId(oView.createId("expertPanel"));
        var oExpertGraph = oCore.byId(oView.createId("expertGraph"));
        var oExpertTable = oCore.byId(oView.createId("expertTableLayout"));

        this.oView._oVLayout.removeContent(oExpertTable);
        this.oView._oVLayout.addContent(oExpertGraph);
        this.oView._oVLayout.addContent(oExpertPanel);
    },

    selectTableView : function() {
        var oCore = sap.ui.getCore();
        var oView = this.getView();
        var oExpertPanel = oCore.byId(oView.createId("expertPanel"));
        var oExpertGraph = oCore.byId(oView.createId("expertGraph"));
        var oExpertTable = oCore.byId(oView.createId("expertTableLayout"));

        oExpertPanel.addStyleClass("sapUiInoDisplayNone");
        this.oView._oVLayout.removeContent(oExpertGraph);
        this.oView._oVLayout.addContent(oExpertTable);
    },

    setExpert : function(oExpert) {
        this._expertModel.setData(oExpert);
    },

    removeMessages : function() {
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("expertfinder");

        var oTextField = sap.ui.getCore().byId(this.getView().createId("tagtextfield"));
        if (oTextField) {
            oTextField.setValueState(sap.ui.core.ValueState.None);
        }
    },

    setMessage : function(oLevel, sMsgCode, aParameters) {
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("expertfinder");
        this.addMessage(oLevel, sMsgCode, aParameters);
    },

    addMessage : function(oLevel, sMsgCode, aParameters) {
        var oTextField = sap.ui.getCore().byId(this.getView().createId("tagtextfield"));
        var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
        var oMessageParameters = {
            key : sMsgCode,
            level : oLevel,
            parameters : aParameters ? aParameters : [],
            group : "expertfinder",
            text : oMsg.getResourceBundle().getText(sMsgCode, aParameters),
            referenceControl : oTextField
        };
        var oMessage = new sap.ui.ino.application.Message(oMessageParameters);

        sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
        oMessage.showValueState();
    }

});