/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["./BaseController","sap/uxap/BlockBase"],function(B,a){return B.extend("sap.ino.vc.commons.BaseBlockController",{getBlockView:function(){var v=B.prototype.getView.apply(this,arguments);if(v.getParent()&&v.getParent().getMetadata().getParent()&&v.getParent().getMetadata().getParent().getName()==="sap.uxap.BlockBase"){v.data=function(){var p=v.getParent();return p.data.apply(p,arguments);};}return v;}});});
