$.response.cacheControl = "no-cache, no-store";
$.response.contentType = "text/html";
$.response.status = $.net.http.SEE_OTHER;
$.response.headers.set("Location", "/sap/ino/config");