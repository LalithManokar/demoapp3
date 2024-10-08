sap.ui.define(["sap/ino/vc/commons/BaseController","sap/ino/commons/application/Configuration","sap/ui/model/json/JSONModel","sap/ino/vc/commons/TopLevelPageFacet","sap/ui/Device","sap/ino/vc/commons/mixins/ClipboardMixin","sap/ino/vc/commons/mixins/IdentityQuickviewMixin","sap/ino/commons/formatters/ObjectListFormatter","sap/m/SegmentedButtonItem"],function(B,C,J,T,D,a,I,O,S){"use strict";var f={formatTitle:function(c,t){return t;},formatMyRanking:function(u){var c=C.getCurrentUser().USER_ID;if(u===c){return true;}else{return false;}},formatRankImage:function(s){var i=parseInt(s,10);if(i>3){return null;}var p=jQuery.sap.getModulePath("sap.ino.assets");if(i===1){return p+"/img/leaderBoard/gold2x.png";}else if(i===2){return p+"/img/leaderBoard/sliver2x.png";}else if(i===3){return p+"/img/leaderBoard/bronze2x.png";}},formatVisbleNumber:function(s){if(parseInt(s,10)>3){return true;}else{return false;}},formatVisbleRankImage:function(s){if(parseInt(s,10)<=3){return true;}else{return false;}},formatTooltipRank:function(s){return this.getText("LEADER_BOARD_RANK",[s]);}};jQuery.extend(f,O);return B.extend("sap.ino.vc.gamification.LeaderBoard",jQuery.extend({},T,a,I,{routes:["leaderboard"],formatter:f,view:{"showCommentDialogBtn":false},onInit:function(){B.prototype.onInit.apply(this,arguments);this.oViewModel=this.getModel("view");this.oViewModel.setData(this.view,true);},onRouteMatched:function(){this.generateDimensionSegmentBtn();},generateDimensionSegmentBtn:function(){var t=this;var s=this.byId('leaderBoardSegBtn');var u=C.getBackendRootURL()+"/sap/ino/xs/rest/common/dimension.xsjs/getAllActiveDimension";var A=jQuery.ajax({url:u,headers:{"X-CSRF-Token":C.getXSRFToken()},dataType:"json",type:"POST",contentType:"application/json; charset=UTF-8",async:true});A.done(function(r){var d=r.RESULT.ALL_ACTIVE_DIMENSION;var m=new J();m.setData(d);t.getView().setModel(m,"dimension");if(d.length===0){return;}if(s){s.removeAllItems();var o=new S({text:"{dimension>NAME}",tooltip:"{dimension>NAME}",key:"{dimension>ID}",press:function(e){t.onPressItem(e);}});s.bindItems({path:"dimension>/",template:o});}var w=d.length*10;s.setWidth("80%");s.fireSelect(s.getItems()[0]);t.setViewProperty("/SELECTED_DIMENSION_ID",d[0].ID);t.bindViewData();});},onPressItem:function(e){var s=e.getSource();var c=s.getKey();var b=this.getModel("dimension").getData();for(var i=0;i<b.length;i++){if(c===b[i].ID.toString()){this.setViewProperty("/SELECTED_DIMENSION_ID",b[i].ID);break;}}this.byId('leaderBoardSegBtn').setBusy(true);this.bindViewData();},bindViewData:function(){var t=this;var l=this.getFragment("sap.ino.vc.gamification.fragments.leaderBoardItem");var b={DIMENSION_ID:this.getViewProperty("/SELECTED_DIMENSION_ID")};var u=C.getBackendRootURL()+"/sap/ino/xs/rest/common/dimension.xsjs/getLeaderBoardByDimension";var A=jQuery.ajax({url:u,headers:{"X-CSRF-Token":C.getXSRFToken()},data:JSON.stringify(b),dataType:"json",type:"POST",contentType:"application/json; charset=UTF-8",async:true});A.done(function(r){var L=r.RESULT.LeaderBoardRanking;var s=r.RESULT.SelfRanking;var m=t.getView().getModel("dimension");var c=[],d=false,e=null,g=null;for(var i=0;i<L.length;i++){e=null;if(JSON.stringify(L[i].BADGE)!=="{}"&&L[i].BADGE.currentBadge.Attachment&&L[i].BADGE.currentBadge.Attachment.length>0){e=L[i].BADGE.currentBadge.Attachment[0].ATTACHMENT_ID;}c.push({USER_ID:L[i].IDENTITY_ID,USER_NAME:L[i].NAME,IMAGE_ID:L[i].IDENTITY_IMAGE_ID,SEQUENCE:L[i].ranking,BADGE_IMAGE_ID:e,BADGE_NAME:JSON.stringify(L[i].BADGE)!=="{}"?L[i].BADGE.currentBadge.NAME:null});if(s&&!d){d=L[i].IDENTITY_ID===s.IDENTITY_ID?true:false;}}if(s&&!d){if(JSON.stringify(s.BADGE)!=="{}"&&s.BADGE.currentBadge.Attachment&&s.BADGE.currentBadge.Attachment.length>0){g=s.BADGE.currentBadge.Attachment[0].ATTACHMENT_ID;}c.push({USER_ID:s.IDENTITY_ID,USER_NAME:s.NAME,IMAGE_ID:s.IDENTITY_IMAGE_ID,SEQUENCE:s.ranking,BADGE_IMAGE_ID:g,BADGE_NAME:JSON.stringify(s.BADGE)!=="{}"?s.BADGE.currentBadge.NAME:null});}m.setProperty("/LeaderBoardRanking",c);var o={path:"dimension>/LeaderBoardRanking",template:l};var h=t.byId("leaderBoardList");h.bindItems(o);});t.byId('leaderBoardSegBtn').setBusy(false);}}));});
