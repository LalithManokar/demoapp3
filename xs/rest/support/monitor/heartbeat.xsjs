//basically a select statement on the dummy table should be sufficient to check if the index server or XSEngine is running 
$.import("sap.ino.xs.xslib", "traceWrapper")
.wrap_request_handler(function() {
	var result;
	try{
		const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
		const hq = $.import("sap.ino.xs.xslib", "hQuery").hQuery(conn);
		hq.setSchema('SAP_INO');
		result = hq.statement("select 'indexServer is running' as pong from dummy").execute()[0].PONG;
		
		if(result != 'indexServer is running'){
			throw new Error(result);
		}
		
		$.response.status = $.net.http.OK;
	}catch(err){
		result = err.message;
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}finally{
		$.response.contentType = "text/plain";
		$.response.setBody(result);
	}
});	