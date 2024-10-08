/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ino/commons/models/aof/ApplicationObject","sap/ino/commons/models/aof/ApplicationObjectChange","sap/ino/commons/models/object/Idea","sap/ino/commons/models/core/ReadSource"],function(A,a,I,R){"use strict";var F=A.extend("sap.ino.commons.models.object.FollowUp",{objectName:"sap.ino.xs.object.followup.FollowUp",readSource:R.getDefaultAOFSource(),actionImpacts:{"del":[{"objectName":"sap.ino.commons.models.object.Idea","objectKey":"OBJECT_ID","impactedAttributes":["FOLLOW_UP_ID","FOLLOW_UP_DATE"]}],"create":[{"objectName":"sap.ino.commons.models.object.Idea","objectKey":"OBJECT_ID","impactedAttributes":["FOLLOW_UP_ID","FOLLOW_UP_DATE"]}],"update":[{"objectName":"sap.ino.commons.models.object.Idea","objectKey":"OBJECT_ID","impactedAttributes":["FOLLOW_UP_ID","FOLLOW_UP_DATE"]}],"massModify":[{"objectName":"sap.ino.commons.models.object.Idea","objectKey":"ideaIds","impactedAttributes":["FOLLOW_UP_ID","FOLLOW_UP_DATE"]}]},determinations:{onCreate:function(){return{OBJECT_TYPE_CODE:"IDEA"};}},relativeDates:[{"key":"NONE"},{"key":"TODAY"},{"key":"TOMORROW"},{"key":"THIS_WEEK"},{"key":"NEXT_WEEK"},{"key":"IN_A_WEEK"},{"key":"IN_TWO_WEEKS"},{"key":"THIS_MONTH"},{"key":"NEXT_MONTH"},{"key":"IN_A_MONTH"},{"key":"IN_TWO_MONTHS"}]});return F;});
