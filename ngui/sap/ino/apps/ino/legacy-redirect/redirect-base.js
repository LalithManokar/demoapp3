(function() {
    this.getNewHash = function(sLegacyOrigin, sLegacyHash, oMap) {
        var sNewHash;
        var aLegacyMatched;
        if (oMap && oMap[sLegacyOrigin]) {
            for(var i=0; i<oMap[sLegacyOrigin].length; i++) {
                var oRule = oMap[sLegacyOrigin][i];
                if (oRule.source) {
                    var oRE = new RegExp(oRule.source);
                    aLegacyMatched = oRE.exec(sLegacyHash);
                    var f = oRule.mapper;
                    if (aLegacyMatched) {
                        if (window.console) {
                            console.log("REDIRECT: Matching pattern:", sLegacyOrigin, ":", oRule.source);
                            //jQuery.sap.log.info("REDIRECT: Matching pattern:", sLegacyOrigin, ":", oRule.source);
                        }
                        if (f) {
                            if (typeof(window[f]) === "function") {
                                try {
                                    sNewHash = window[f](aLegacyMatched, oRule.target);
                                } catch (ex) {
                                    // hash not parsable
                                    sNewHash = "#";
                                }
                            } else {
                                if (window.console) {
                                    console.error("REDIRECT: Undefined mapper function:", f);
                                    //jQuery.sap.log.error("REDIRECT: Undefined mapper function:", f);
                                }
                            }
                            break; 
                        } else {
                            var v1 = RegExp.$1;
                            var v2 = RegExp.$2;
                            sNewHash = oRule.target.replace(/\$1/i, v1).replace(/\$2/i, v2);
                            break; 
                        }
                    }
                }
            }
        }
        return sNewHash || "";
    };
    
    this.getURLParameterByName = function(name, qString) {
        var aMatchedParam = qString.match("[?&]" + name + "=([^&#]*)|&|#|$");
        if (!aMatchedParam || !aMatchedParam[1]) {
            return null;
        }
        return decodeURIComponent(aMatchedParam[1]);
    };

    this.doRedirect = function(oMap) {
        var sLegacyHash = decodeURIComponent(window.location.hash);
        var sLegacyOrigin = decodeURIComponent(this.getURLParameterByName("sap-ino-origin", window.location.search));
        var sTargetURL =  decodeURIComponent(this.getURLParameterByName("sap-ino-target", window.location.search)) + "/";
        // prevent malicious referral to other domains, e.g. by setting sap-ino-target=/www.malicious.com
        sTargetURL = "/" + sTargetURL.replace(/^([\/\\]*)/, "");
        var sNewHash = this.getNewHash(sLegacyOrigin, sLegacyHash, oMap);
        //alert("The application URL has been changed. You will be forwarded to the new application URL. Please update your bookmarks");
        if (window.console) {
            console.log("REDIRECT: Target URL:", sTargetURL + sNewHash);
            //jQuery.sap.log.info("REDIRECT: Target URL:", sTargetURL + sNewHash);
        }
        location.replace(sTargetURL + sNewHash);
    };
    
    jQuery.getJSON("redirect.json", this.doRedirect.bind(this));
})();