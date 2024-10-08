/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ino/commons/models/aof/ApplicationObject","sap/ino/commons/models/core/ReadSource"],function(A,R){"use strict";return A.extend('sap.ino.commons.models.object.Tag',{objectName:"sap.ino.xs.object.tag.Tag",readSource:R.getDefaultODataSource("Tags"),invalidation:{entitySets:["Tags","SearchTags","SearchTagsAllFull","MyTagFollow","SearchTagsAll"]}});});
