/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ino/commons/models/aof/ApplicationObject","sap/ino/commons/models/core/ReadSource"],function(A,R){"use strict";return A.extend("sap.ino.commons.models.object.CampaignComment",{objectName:"sap.ino.xs.object.campaign.Comment",readSource:R.getDefaultAOFSource(),invalidation:{entitySets:["CampaignComment"]},actionImpacts:{"del":[{"objectName":"sap.ino.commons.models.object.Campaign","objectKey":"OBJECT_ID","impactedAttributes":["COMMENT_COUNT"]}],"create":[{"objectName":"sap.ino.commons.models.object.Campaign","objectKey":"OBJECT_ID","impactedAttributes":["COMMENT_COUNT"]}]}});});
