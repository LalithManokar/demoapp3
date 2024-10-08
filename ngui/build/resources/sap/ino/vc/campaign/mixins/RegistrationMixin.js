sap.ui.define(["sap/ino/vc/idea/mixins/BaseActionMixin","sap/ino/vc/commons/BaseController","sap/ino/commons/models/aof/PropertyModel","sap/m/MessageToast","sap/ino/commons/models/object/Registration","sap/ui/core/IconPool","sap/ui/model/json/JSONModel"],function(B,a,P,M,R,I,J){"use strict";var b=function(){throw"Mixin may not be instantiated directly";};b.Register=function(e){var s=this;var c=e.getSource();var i=c.getBindingContext("data").getProperty("ID");var v=c.getBindingContext("data").getProperty("REGISTER_ID");var d=c.getBindingContext('data').getProperty('REGISTER_STATUS');var f=c.getBindingContext('data').getProperty('IS_REGISTER_AUTO_APPROVE');var g,t;if(c.setEnabled){c.setEnabled(false);}if(!v){g=R.Register(v,i);t='REGISTER_MSG_REGISTER';}else if(d===3){g=R.Register(null,i);t='REGISTER_MSG_REGISTER';}else{g=R.Leave(v,i);t='REGISTER_MSG_LEAVE';}if(f&&f===1&&t!=='REGISTER_MSG_LEAVE'){t='REGISTER_MSG_SUCCESS';}g.done(function(){c.setEnabled(true);M.show(s.getText(t));if(f&&f===1&&t!=='REGISTER_MSG_LEAVE'){s.navigateTo('campaignlist');s.navigateTo("campaign",{id:i});}if(d===2){P.invalidateCachedProperties('sap.ino.xs.object.campaign.Campaign',i);return s.navigateTo('campaignlist');}if(s.isGlobalSearch){s.getSearchResult(s.getViewProperty("/SEARCH_QUERY"));}}).fail(function(){c.setEnabled(true);M.show(s.getText('MSG_CAMPAIGN_REGISTER_ERROR'));});};b.Approved=function(e){var s=this;var c=e.getSource();var v=c.getBindingContext("data").getProperty("REGISTER_ID");var d=R.Approved(v);var t='REGISTER_MSG_APPROVED';if(c.setEnabled){c.setEnabled(false);}d.done(function(){M.show(s.getText(t));c.setEnabled(true);s.bindList();}).fail(function(){M.show(s.getText('REGISTER_ERROR_MASSAGE'));});};b.Rejected=function(e){var s=this;var c=e.getSource();var v=c.getBindingContext("data").getProperty("REGISTER_ID");var t='REGISTER_MSG_REJECTED';var r=this.getRejectReasonDialog();var m=new J({REJECT_REASON:"",VALUE:v});r.setModel(m,"register");r.open();};b.Leave=function(e){var s=this;var c=e.getSource();var v=c.getBindingContext("data").getProperty("REGISTER_ID");var d=R.Leave(v);var t='REGISTER_MSG_LEAVE';if(c.setEnabled){c.setEnabled(false);}d.done(function(){M.show(s.getText(t));c.setEnabled(true);}).fail(function(){M.show(s.getText('REGISTER_ERROR_MASSAGE'));});};b.isVisabled=function(i,c,s){return(!!i&&!!c)||(!!i&&!c&&s===2);};b.isVisabledForApprove=function(s){return s===1;};b.isVisabledForList=function(i,c,s){return!!i&&!!c&&s!==2;};b.isEnabled=function(s,d,c){if(s!==1){if(c===1){if(d===0){return true;}else{return false;}}else{return true;}}else{return false;}};b.onApprovalListSelectionChange=function(e){var t=this;var s=e.getParameter("selected");var S=e.getSource();var d=S.getBindingContext("data").getObject();if(!this._oSelectionMap){this._oSelectionMap=[];}if(!this._oSelectedCheckBox){this._oSelectedCheckBox=[];}function c(_){var o=t.byId("sapInoMassRegisterAcceptBtn");var f=t.byId("sapInoMassRegisterRejectBtn");if(o&&f){o.setEnabled(_.length>0);f.setEnabled(_.length>0);}}this.actionButtonEnabledStatus=c;if(s){this._oSelectionMap.push(d.REGISTER_ID);this._oSelectedCheckBox.push(S);}else{var i=this._oSelectionMap.indexOf(d.REGISTER_ID);this._oSelectionMap.splice(i,1);}c(this._oSelectionMap);};b.onApprovalMassAction=function(e){var r=this._oSelectionMap;var s=this._oSelectedCheckBox;var c=this;var d=e.getSource().getCustomData();var S=d[0].getValue()*1?"sap.ino.config.REGISTER_APPROVED":"sap.ino.config.REGISTER_REJECTED";var t=d[0].getValue()*1?"OBJECT_MSG_REG_ACCEPT_SUCCESS":"OBJECT_MSG_REG_REJECT_SUCCESS";var E=d[0].getValue()*1?"REGISTER_APPROVE_MSG_ERROR":"REGISTER_REJECT_MSG_ERROR";var o={parameters:{ids:r,status:S}};if(d[0].getValue()*1){var m=a.prototype.executeObjectAction.call(this,R,"massUpdate",o);m.done(function(){M.show(c.getText(t));c.bindList();c._oSelectionMap=[];}).fail(function(){M.show(c.getText(E));for(var i=0;i<s.length;i++){s[i].setSelected(false);}});r=[];this.actionButtonEnabledStatus.call(this,r);}else{var f=this.getRejectReasonDialog();var g=new J({REJECT_REASON:"",MASS_ACTION_REJECT:true});f.setModel(g,"register");f.open();}};b.transText=function(s){var t;switch(s){case 0:t='REGISTER_TEXT_REGISTER';break;case 1:t='REGISTER_TEXT_PENDING';break;case 2:t='REGISTER_TEXT_LEAVE';break;case 3:t='REGISTER_TEXT_REGISTER';break;default:t='REGISTER_TEXT_REGISTER';break;}return this.getText(t);};b.transTooltip=function(s,d,c){var t;if(c===1&&d===1){t='REGISTER_TOOLTIP_REGISTER_DISABLED';return this.getText(t);}switch(s){case 0:t='REGISTER_TOOLTIP_REGISTER';break;case 1:t='REGISTER_TOOLTIP_PENDING';break;case 2:t='REGISTER_TOOLTIP_LEAVE';break;case 3:t='REGISTER_TOOLTIP_REGISTER';break;default:t='REGISTER_TOOLTIP_REGISTER';break;}return this.getText(t);};b.transIcon=function(s){var i;switch(s){case 0:i=I.getIconURI('register','InoIcons');break;case 1:i=I.getIconURI('pending','InoIcons');break;case 2:i=I.getIconURI('journey-depart');break;case 3:i=I.getIconURI('register','InoIcons');break;default:i=I.getIconURI('register','InoIcons');break;}return i;};b.getRejectReasonDialog=function(){if(!this._rejectReasonDialog){this._rejectReasonDialog=this.createFragment("sap.ino.vc.campaign.fragments.RejectReasonDialog",this.getView().getId());this.getView().addDependent(this._rejectReasonDialog);}return this._rejectReasonDialog;};b.onHandleRejectCancel=function(e){var d=this.getRejectReasonDialog();var m=d.getModel("register");d.close();};b.onHandleRejectOK=function(e){var s=this;var t='REGISTER_MSG_REJECTED';var r=this.getRejectReasonDialog();var m=r.getModel("register");var v=m.getProperty("/VALUE");var c=m.getProperty("/REJECT_REASON");r.setBusy(true);if(!m.getProperty("/MASS_ACTION_REJECT")){var d=R.Rejected(v,c);d.done(function(){M.show(s.getText(t));r.setBusy(false);r.close();s.bindList();}).fail(function(){r.setBusy(false);M.show(s.getText('REGISTER_ERROR_MASSAGE'));});}else{var f=this._oSelectionMap;var g=this._oSelectedCheckBox;var S="sap.ino.config.REGISTER_REJECTED";var h="OBJECT_MSG_REG_REJECT_SUCCESS";var E="REGISTER_REJECT_MSG_ERROR";var o={parameters:{ids:f,status:S,REASON:c}};var j=a.prototype.executeObjectAction.call(this,R,"massUpdate",o);j.done(function(){M.show(s.getText(h));r.setBusy(false);s.bindList();s._oSelectionMap=[];r.close();}).fail(function(){r.setBusy(false);M.show(s.getText(E));for(var i=0;i<g.length;i++){g[i].setSelected(false);}});f=[];this.actionButtonEnabledStatus.call(this,f);}};b.onRejectReasonLiveChange=function(e){var s=e.getSource();var r=this.byId("rejectReasonBtn");if(s.getValue().length>0){r.setEnabled(true);}else{r.setEnabled(false);}};return b;});
