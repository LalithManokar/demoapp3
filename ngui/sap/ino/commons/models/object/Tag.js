/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
    "use strict";
    
    return ApplicationObject.extend('sap.ino.commons.models.object.Tag', {
        objectName: "sap.ino.xs.object.tag.Tag",
        readSource: ReadSource.getDefaultODataSource("Tags"), 
        invalidation : {
            entitySets : ["Tags", "SearchTags", "SearchTagsAllFull", "MyTagFollow", "SearchTagsAll"]
        }
    });
});