$.response.cacheControl = "no-cache, no-store";
$.response.contentType = "text/html";
$.response.status = $.net.http.OK;
$.response.setBody($.session.getUsername() ? "true" : "false");