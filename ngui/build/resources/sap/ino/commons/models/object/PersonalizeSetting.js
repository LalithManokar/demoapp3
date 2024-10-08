/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ino/commons/models/aof/ApplicationObject","sap/ino/commons/models/core/ReadSource","sap/ui/core/message/Message","sap/ui/core/MessageType"],function(A,R,M,a){"use strict";var P=A.extend("sap.ino.commons.models.object.PersonalizeSetting",{objectName:"sap.ino.xs.object.iam.PersonalizeSetting",readSource:R.getDefaultAOFSource(),checkQuickLinkNameValid:c});P.defaultPesonalize={IDEA_VIEW:true,CAMPAIGN_VIEW:true,SCREEN_SIZE:true,FILTER:true,SIMILAR_IDEA:true,FILTER_ACTIVE_IDEA:false,REPORT_VIEW:false};function c(d,n,s){var v=true;for(var i=0;i<d.length;i++){if(d[i].LINK_TEXT===n||s.indexOf(n)>=0){v=false;}}return v;}return P;});
