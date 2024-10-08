sap.ui.getCore().loadLibrary("sap.ino.wall");sap.ui.define(["sap/ino/vc/commons/BaseObjectController","sap/ino/commons/formatters/ObjectListFormatter","sap/ino/commons/application/Configuration","sap/ui/model/odata/ODataModel","sap/ui/core/format/NumberFormat"],function(B,O,C,a,N){"use strict";var p={"DPO":"sap.ino.vc.idea.fragments.PPMProjectDetail","PPO":"sap.ino.vc.idea.fragments.PPMItemDetail","TPO":"sap.ino.vc.idea.fragments.PPMTaskDetail","TTO":"sap.ino.vc.idea.fragments.PPMTaskDetail"};return B.extend("sap.ino.vc.idea.PPM",{formatter:jQuery.extend({currentStep:function(c){return c-1;},successProbability:function(s){var n=N.getPercentInstance({maxFractionDigits:3});return n.format(s/1000);}},this.formatter,O),onInit:function(){B.prototype.onInit.apply(this,arguments);var s=C.getPPMURL();this.oPPMModel=new a(s,false);this.setModel(this.oPPMModel,"ppm");},onBeforeRendering:function(e){var i=this.getObjectModel().getProperty("/ID");var I=("0000000000"+i).slice(-10);var l=this.getView().byId("ideaPPMList");var o=new sap.ui.model.Filter("IdeaID","EQ",I);l.getBinding("items").filter(o);},onExpand:function(e){var s=e.getSource();var c=s.getBindingContext("ppm");if(e.getParameter("expand")&&c){s.toggleStyleClass("sapInoPPMExpanded");var d=c.getObject();var o=d.LinkedObjectType;var P=d.LinkedEntity.split("/");var b=P[P.length-2];var f;if(b){f=this.createFragment(p[o]);f.bindElement("ppm>/"+b);}s.addContent(f);}else{s.toggleStyleClass("sapInoPPMExpanded");s.removeAllContent();}}});});
