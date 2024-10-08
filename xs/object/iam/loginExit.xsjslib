/**
 *  login.xsjslib enhancement spot: loginExit.xsjslib
 */

/**
 * Can be overwritten to enhance SAML User Information.
 * Default implementation does nothing.
 *
 * Parameters:
 *      oUser: Current user object or null if user does not exist yet (read-only)
 *      oSAMLUserInfo: SAML user information. Can be modified to adjust SAML User Information
 */
this.enhanceSAMLUserInfo = function(oUser, oSAMLUserInfo) {};

/**
 * Can be overwritten to prevent login processing.
 * Default implementation allows login.
 *
 * Parameters:
 *      oUser: Current user object or null if user does not exist yet (read-only)
 *      oSAMLUserInfo: SAML user information (read-only). Undefined if no SAML Authentication is used.
 * Returns:
 *      Boolean: True, if login shall be allowed, else if not
 */
this.allowLogin = function(oUser, oSAMLUserInfo) {
	return true;
};

/**
 * Can be overwritten to fail to execute login.
 * Default implementation that reject user.
 */
this.failToLogin = function() {
	$.response.status = $.net.http.FORBIDDEN;
	$.response.setBody("Failed to login application user.");
};