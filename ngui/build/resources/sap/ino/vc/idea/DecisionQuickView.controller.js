sap.ui.define(["sap/ino/vc/commons/BaseObjectController"],function(B){"use strict";return B.extend("sap.ino.vc.idea.DecisionQuickView",jQuery.extend({},{open:function(c,i){var t=this;var v=this.getView();var d=v.byId("decisionCard");v.bindElement({path:"data>/IdeaDecision("+i+")",events:{change:function(e){jQuery.sap.delayedCall(0,t,function(){d.openBy(c);});}}});}}));});
