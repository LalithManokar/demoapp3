/**
 *  IdeaObjectIntegration.xsjslib enhancement spot: IdeaObjectIntegrationEs.xsjslib
 */

/**
 * Can be overwritten to enhance Idea Information. 
 * Default implementation does nothing.
 * 
 * Parameters:
 *      oIdeaObject: Current idea object or null if user does not exist yet. Can be modified to adjust Idea Information
 *      oApiInfo: API information(read-only).
 */
this.enhanceIdeaInfo = function(oIdeaObject, oApiInfo) {
    //do nothing
};

/**
 * Can be overwritten to enhance Response Information that from third system. 
 * Default implementation does nothing.
 * 
 * Parameters:
 *      oResponse: Can be modified to adjust Response Information that from third system.  
 *      oApiInfo: API information(read-only).
 */
this.enhanceResponseInfo = function(oResponse, oApiInfo){
    //do nothing
};

/**
 * Can be overwritten to enhance Request Information that to third system. 
 * Default implementation does nothing.
 * 
 * Parameters:
 *      oRequest: Can be modified to adjust Request Information that to third system.  
 *      oApiInfo: API information(read-only).
 */
this.enhanceRequest = function(oRequest, oApiInfo){
    //do nothing
};
