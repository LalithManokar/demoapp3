sap.ui.define(["sap/ino/commons/models/aof/PropertyModel","sap/m/MessageToast","sap/ino/commons/models/object/IdeaFollow","sap/ino/commons/models/object/CampaignFollow","sap/ino/commons/models/object/TagFollow","sap/ui/model/json/JSONModel"],function(P,M,I,C,T,J){"use strict";var F=function(){throw"Mixin may not be instantiated directly";};F.onFollow=function(E){var s=this;var v=E.getParameter('value');var t=E.getParameter('type');var o=E.getParameter('objectId');var f;var a=v?'FOLLOW_REMOVE_FOLLOW_SUCCESS':'FOLLOW_MSG_FOLLOW_SUCCESS';var b=E.getSource();if(!v){this.oIdeaFollowModel=new J();}switch(t){case'IDEA':f=I.follow(o,t,v);break;case'CAMPAIGN':f=C.follow(o,t,v);break;case'TAG':f=T.follow(o,t,v);break;default:return false;}if(b&&b.setEnabled){b.setEnabled(false);}f.done(function(c){M.show(s.getText(a));if(s.oIdeaFollowModel){var r={ID:c.GENERATED_IDS?c.GENERATED_IDS[-1]:undefined};s.oIdeaFollowModel.setProperty("/"+t+"("+o+")",r);}b.setEnabled(true);b.rerender();if(s.isGlobalSearch){s.getSearchResult(s.getViewProperty("/SEARCH_QUERY"));}});f.fail(function(){if(b.setEnabled){b.setEnabled(true);}});};return F;});
