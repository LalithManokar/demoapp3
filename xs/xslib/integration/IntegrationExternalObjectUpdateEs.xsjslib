/**
 *  integrationExternalObjectUpdate.xsjslib enhancement spot: integrationExternalObjectUpdateEs.xsjslib
 */

/**
 * Can be overwritten to enhance Idea Information. 
 * Default implementation does nothing.
 * 
 * Parameters:
 *      oReq: Service whole request info, include body and header
 *      oBody: Request body
 *      aHeaders: Request headers
 *      oSysteminfoAndObjectKey: The corresponding info and object key. we set the default value null
 *                               {systemHost:null,objectKey:null}, when you get the value please set the corresponding value to this object
 *                               systemHost: this value is which you input in the destinations extended.
 *                               example:{systemHost:"www.sap.com",objectKey:123456}
 * 
 */
this.getSysteminfoAndObjectKey = function(oReq,oBody,aHeaders,oSysteminfoAndObjectKey) {
    //do nothing
};
