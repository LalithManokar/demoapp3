sap.ui.define(["sap/ino/commons/models/object/IdeaRead","sap/m/MessageToast","sap/ino/commons/models/core/CodeModel","sap/ui/model/json/JSONModel"],function(I,M,C,J){"use strict";var i=function(){throw"Mixin may not be instantiated directly";};i.checkIdeaRead=function(a){return!!a;};i.isRead=function(a){return!a;};i.onMarkRead=function(e){var s=e.getSource();var c=s.getCustomData()&&s.getCustomData();var r=c[0]&&c[0].getValue();var a=c[1]&&c[1].getValue();I.markRead(r,{IDEA_ID:a}).done(function(d){if(d){s.setEnabled(false);s.setProperty('enabled',false);}});};return i;});
