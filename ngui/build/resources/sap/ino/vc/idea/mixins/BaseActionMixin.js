sap.ui.define(["sap/ino/commons/models/aof/PropertyModel","sap/ino/commons/formatters/ObjectFormatter","sap/ino/controls/OrientationType","sap/ino/commons/models/object/Idea"],function(P,O,a,I){"use strict";var B=function(){throw"Mixin may not be instantiated directly";};B.isActionContextSingleIdeaDisplay=function(){return!!(this.getObjectModel&&this.getObjectModel()&&this.getObjectModel().getMetadata&&this.getObjectModel().getMetadata().getName()==="sap.ino.commons.models.object.Idea");};B.saveCurrentFocusBeforeActionDialogOpen=function(){this._sActionCurrentFocusId=sap.ui.getCore().getCurrentFocusedControlId();};B.restoreFocusAfterActionDialogClose=function(){if(this._sActionCurrentFocusId){var c=sap.ui.getCore().getElementById(this._sActionCurrentFocusId);if(c&&c.focus){c.focus();}this._sActionCurrentFocusId=undefined;}};B.resetActionState=function(i){if(this.isActionContextSingleIdeaDisplay()&&typeof(this.resetClientMessages)==="function"){this.resetClientMessages();}if(i){this._refreshMassActionState();}else{this._resetMassActionState();}};B.onAfterActionDialogClose=function(e){var d=e.getSource();this.resetActionState(d.data("context")==="mass");};B._computeActionAggregations=function(){return jQuery.map(this._oSelectionMap,function(v){return v;}).reduce(function(l,i){var b=O.isFinal(i.STATUS);if(l){l.ideas.push(i.ID);l.authors.push(i.SUBMITTER_ID);if(l.campaigns.indexOf(i.CAMPAIGN_ID)===-1){l.campaigns.push(i.CAMPAIGN_ID);}if(l.phases.indexOf(i.PHASE)===-1){l.phases.push(i.PHASE);}if(l.status.indexOf(i.STATUS)===-1){l.status.push(i.STATUS);}if(l.respValueCode.indexOf(i.RESP_VALUE_CODE)===-1){l.respValueCode.push(i.RESP_VALUE_CODE);}l.addExpert.push(i.property.actions.addExpert.enabled);l.assignTag.push(i.property.actions.assignTag.enabled);l.assignCoach.push(i.property.actions.assignCoach.enabled);l.assignToMe.push(i.property.actions.assignToMe.enabled);l.unassignCoach.push(i.property.actions.unassignCoach.enabled);l.executeStatusTransition.push(i.property.actions.executeStatusTransition.enabled);l.followUp.push(!b);l.reassignCampaign.push(i.property.actions.reassignCampaign.enabled);var s=i.property.actions.executeStatusTransition.customProperties.statusTransitions.map(function(t){return t.STATUS_ACTION_CODE;});l.transitions=l.transitions.filter(function(c){return s.indexOf(c)!==-1;});l.changeAuthor=l.changeAuthor&&l.authors[l.authors.length-1]===l.authors[0];l.merge.push(i.property.actions.mergeIdeas.enabled);return l;}else{return{ideas:[i.ID],campaigns:[i.CAMPAIGN_ID],phases:[i.PHASE],status:[i.STATUS],respValueCode:[i.RESP_VALUE_CODE],addExpert:[i.property.actions.addExpert.enabled],assignTag:[i.property.actions.assignTag.enabled],assignCoach:[i.property.actions.assignCoach.enabled],assignToMe:[i.property.actions.assignToMe.enabled],unassignCoach:[i.property.actions.unassignCoach.enabled],reassignCampaign:[i.property.actions.reassignCampaign.enabled],executeStatusTransition:[i.property.actions.executeStatusTransition.enabled],followUp:[!b],transitions:i.property.actions.executeStatusTransition.customProperties.statusTransitions.map(function(t){return t.STATUS_ACTION_CODE;}),authors:[i.SUBMITTER_ID],changeAuthor:i.SUBMITTER_ID!==0,merge:[i.property.actions.mergeIdeas.enabled]};}},null);};B._resetMassActionState=function(){var t=this;if(this._oSelectionMap){jQuery.each(this._oSelectionMap,function(i,o){if(o.oSource&&o.oSource.setSelected){o.oSource.setSelected(false);}});}this._oSelectionMap={};this._oDeselectionMap={};this.setViewProperty("/List/SELECT_ALL",false);var b=["sapInoMassAddExpertBtn","sapInoMassAssignBtn","sapInoMassStatusBtn","sapInoMassFollowUpBtn","sapInoMassDeleteRewardBtn","sapInoMassDeleteEvalReqBtn","sapInoMassAcceptBtn","sapInoMassRejectBtn","sapInoMassFowardBtn","sapInoMassCreateEvalBtn","sapInoMassExportBtn","sapInoMassChangeAuthorBtn","sapInoMassMergeBtn"];jQuery.each(b,function(i,e){var o=t.byId(e);if(o){o.setEnabled(false);}if(e==="sapInoMassExportBtn"&&t.getViewProperty("/List/EXPORT_ALL")){o.setEnabled(true);}});};B._refreshMassActionState=function(){jQuery.each(this._oSelectionMap,function(i,o){if(o.oSource){}});if(this._resetMassActionState){this._resetMassActionState();}};B._deriveMassActionButtonEnabledStatus=function(){var A=this._computeActionAggregations();var _=function(v){return!!v;};var b=this.byId("sapInoMassAddExpertBtn");if(b){b.setEnabled(!!A&&(A.addExpert.every(_)&&A.campaigns.length===1));}var o=this.byId("sapInoMassAssignBtn");if(o){o.setEnabled(!!A&&(A.assignToMe.every(_)||A.unassignCoach.every(_)||A.assignTag.every(_)||(A.assignCoach.every(_)&&A.campaigns.length===1)||(A.addExpert.every(_)&&A.campaigns.length===1)||(A.reassignCampaign.every(_)&&A.campaigns.length===1)));}var c=this.byId("sapInoMassStatusBtn");if(c){c.setEnabled(!!A&&A.campaigns.length===1&&A.phases.length===1&&A.status.length===1&&A.executeStatusTransition.every(_));}var d=this.byId("sapInoMassFollowUpBtn");if(d){d.setEnabled(!!A&&A.ideas.length>0&&A.followUp.every(_));}var e=this.byId("sapInoMassExportBtn");if(e){e.setEnabled(!!A&&A.ideas.length>0);if(!this.getModel("component").getProperty("/SHOW_BACKOFFICE")){e.setEnabled(true);}}var f=this.byId("sapInoMassChangeAuthorBtn");if(f){f.setEnabled(!!A&&A.changeAuthor);}var g=this.byId("sapInoMassMergeBtn");if(g){var C=this._oClipboardModel?this._oClipboardModel.getObjectKeys(I):[];var t=0;if(A){t=A.ideas.length+C.length;g.setEnabled(!!A&&t>1&&t<=10&&A.merge.every(_));}else{g.setEnabled(C.length>1&&C.length<=10);}}};B.onManagedListSelectionChange=function(e){var t=this;var s=e.getParameter("selected");var S=e.getSource();var d=S.getBindingContext("data").getObject();function b(c){var f=c.getSource().getData();d.property=f;t._oSelectionMap[d.ID]=d;t._oSelectionMap[d.ID].oSource=S;t._deriveMassActionButtonEnabledStatus.call(t);}if(s){var o={actions:["addExpert","assignTag","assignCoach","assignToMe","unassignCoach","executeStatusTransition","reassignCampaign","mergeIdeas"]};var p=new P("sap.ino.xs.object.idea.Idea",d.ID,o,false,b);if(this.getViewProperty("/List/SELECT_ALL")){delete this._oDeselectionMap[d.ID];}}else{delete this._oSelectionMap[d.ID];if(this.getViewProperty("/List/SELECT_ALL")){this._oDeselectionMap[d.ID]=d.ID;}this._deriveMassActionButtonEnabledStatus();}S.setTooltip(s?this.getText('IDEA_LIST_CHECKBOX_DESELECT_TOOLTIP'):this.getText('IDEA_LIST_CHECKBOX_SELECT_TOOLTIP'));};B.onFlatListSelectionChange=function(e){var s=e.getParameter("selected");var S=e.getSource();var d=S.getBindingContext("data").getObject();if(s){this._oSelectionMap[d.ID]=d;this._oSelectionMap[d.ID].oSource=S;if(this.getViewProperty("/List/SELECT_ALL")){delete this._oDeselectionMap[d.ID];}}else{delete this._oSelectionMap[d.ID];if(this.getViewProperty("/List/SELECT_ALL")){this._oDeselectionMap[d.ID]=d.ID;}}var b=this.byId("sapInoMassExportBtn");if(b){b.setEnabled(!jQuery.isEmptyObject(this._oSelectionMap));}S.setTooltip(s?this.getText('IDEA_LIST_CHECKBOX_DESELECT_TOOLTIP'):this.getText('IDEA_LIST_CHECKBOX_SELECT_TOOLTIP'));};B.onMassIdeaSelect=function(i,s,g){var b=this.getList().getItems();if(Object.prototype.toString.call(i)==="[object Array]"){b=i;this.setViewProperty("/List/SELECT_ALL",s);}else{this.setViewProperty("/List/SELECT_ALL",!this.getViewProperty("/List/SELECT_ALL"));}var t=this;var o=this.byId("sapInoMassExportBtn");if(this.getViewProperty("/List/SELECT_ALL")){o.setEnabled(true);jQuery.each(b,function(c,d){var A=d.findAggregatedObjects(false,function(h){return(h instanceof sap.ui.layout.VerticalLayout);});var e=A[0].getContent()[0];var f=e.getItems()[e.getItems().length-1];var C=f.getItems()[f.getItems().length-1].getItems()[0];var D=d.getBindingContext("data").getObject();if(t.getViewProperty("/List/MANAGE")){D.property=t._createPropertyData(d);}t._oSelectionMap[D.ID]=D;t._oSelectionMap[D.ID].oSource=C;});}else if(!g){t._oSelectionMap={};}if(this.getViewProperty("/List/MANAGE")){this._deriveMassActionButtonEnabledStatus();}};B._createPropertyData=function(i){var p={actions:{addExpert:{},assignCoach:{},assignTag:{},assignToMe:{},executeStatusTransition:{customProperties:{statusTransitions:[]}},reassignCampaign:{},unassignCoach:{},mergeIdeas:{}}};var s;if(i.getBindingContext){s=i.getBindingContext("data").getProperty("STATUS");}else{s=i.STATUS;}p.actions.addExpert.enabled=!O.isFinal(s);p.actions.assignCoach.enabled=!O.isFinal(s);p.actions.assignTag.enabled=!O.isFinal(s);p.actions.assignToMe.enabled=!O.isFinal(s);p.actions.unassignCoach.enabled=!O.isFinal(s);p.actions.executeStatusTransition.enabled=!O.isFinal(s);p.actions.mergeIdeas.enabled=!O.isMerged(s)&&!O.isFinal(s);return p;};B.formatMergeBtnEnable=function(c){c=c||[];var i=c.filter(function(C){return C.name==="sap.ino.commons.models.object.Idea";});var t=0;if(i.length>0){t=i[0].entry.length+Object.keys(this._oSelectionMap||{}).length;}else{t=Object.keys(this._oSelectionMap||{}).length;}return t>1&&t<=10;};B.formatIdeaCheckBoxTooltip=function(s){return s?this.getText('IDEA_LIST_CHECKBOX_DESELECT_TOOLTIP'):this.getText('IDEA_LIST_CHECKBOX_SELECT_TOOLTIP');};return B;});
