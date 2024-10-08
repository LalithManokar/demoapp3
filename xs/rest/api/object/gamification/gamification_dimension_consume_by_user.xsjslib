var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Dimension = $.import("sap.ino.xs.object.gamification", "Dimension");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function gamification_dimension_consume_by_user(oRequest, return_inf) {
    var errorMessages, i;
    
	try {
		util.getSessionUser(oRequest);//get user
	} catch (e) {
		 errorMessages = {
			"STATUS": "The UserID you input is not existed "
		};
    	$.response.status = 403;
        util.handlError(return_inf, oRequest, errorMessages, $.response);
		return false;
	} 
    
    
	var sCurUserId = util.getUserByUsername($.session.getUsername(), oHQ).ID;
	var sUsername = oRequest.Parameters.Username ? oRequest.Parameters.Username : null ;
	var sConsumedReferenceNo = oRequest.Parameters.ConsumedReferenceNo ? oRequest.Parameters.ConsumedReferenceNo : null ;
	var sComment = oRequest.Parameters.Comment ? oRequest.Parameters.Comment : null;
	var aConsumedDimension = oRequest.Parameters.ConsumedDimension ? oRequest.Parameters.ConsumedDimension : [];
	var sTransactionNo = $.util.createUuid();
	
	if (sUsername === null) {
	    errorMessages = {
			"STATUS": "The Username you input is invalid "
		};
    	$.response.status = 400;
        util.handlError(return_inf, oRequest, errorMessages, $.response);
		return false;
	}
	if (sComment === null) {
		errorMessages = {
			"STATUS": "The Comment you input is invalid "
		};
    	$.response.status = 400;
        util.handlError(return_inf, oRequest, errorMessages, $.response);
		return false;
	}
	

    if(aConsumedDimension instanceof Array){
        
            var oUser = util.getUserByUsername(sUsername, oHQ);
            if(oUser !== null){
                var aUserProfileForGamification = getUserProfileForGamification(oUser.ID, oHQ) || [];
                
                aConsumedDimension.forEach(function(consumedItem){
                    if(consumedItem.DimensionId && !errorMessages){
                        var mappingDimension = aUserProfileForGamification.find(function(item){
                            return item.ID === consumedItem.DimensionId;
                        });
                        if(mappingDimension && consumedItem.ConsumedValue <= mappingDimension.TOTAL_FOR_REDEEM){
                            mappingDimension.TOTAL_FOR_REDEEM -= consumedItem.ConsumedValue
                            var sCreateRecord =	`INSERT INTO "sap.ino.db.gamification::t_gamification_transaction" 
                                          values("sap.ino.db.gamification::s_gamification_transaction".nextval,current_utctimestamp,?,?,?,?,?,?,?)`;
                            try{
                             oHQ.statement(sCreateRecord).execute(sCurUserId, oUser.ID, mappingDimension.ID, consumedItem.ConsumedValue, sConsumedReferenceNo.toString(), sComment, sTransactionNo);
                            }
                            catch(dbError){
                                throw dbError;
                            }
                            
                        }else{
                            errorMessages = {
                    			"STATUS": "The dimension id : " + (mappingDimension ? mappingDimension.ID : 'invalid dimension id') + " you indicated is not sufficient balance "
                    		};
                        	
                        }
                    }
                    
                });
                if(errorMessages){
                         $.response.status = 400;
                         util.handlError(return_inf, oRequest, errorMessages, $.response);
                         return false;
                
                    }
                    
                    
            }
        
    }else{
         errorMessages = {
			"STATUS": "The ConsumedDimension you input is not an Array "
		};
	$.response.status = 400;
    util.handlError(return_inf, oRequest, errorMessages, $.response);
					return false;
    }
	
	if(errorMessages){
	    oConn.rollback();
	}else{
	    oConn.commit();
	}
	var oResponse = util.get_inf(oRequest, return_inf, undefined, {TransactionNo:sTransactionNo});
	util.send_mes(oResponse);
    oConn.close();
	return;

}

// generate user profile for gamification
function getUserProfileForGamification(sUserId,oHQ){
    if(sUserId){
        var aGamification = [];
        var sSelectAllActiveDimenison = ` select dimension.id,dimension.name,dimension.status,dimension.redeem, unit.default_text as dimension_unit,ifnull(sum(value),0) as total  from "sap.ino.db.gamification::t_dimension" as dimension
                                       left outer join (select * from "sap.ino.db.gamification::t_activity_log" as activity
                                       
                                       inner join "sap.ino.db.gamification::t_identity_log_for_activity" as identity
                                       on activity.id = identity.activity_id and  identity_id = ?)as activity
                                       on dimension.id = activity.dimension_id
                                       inner join "sap.ino.db.basis::t_unit" as unit
                                       on dimension.unit = unit.code
                                       where dimension.redeem = 1  
                                       group by dimension.id,dimension.name,dimension.status,dimension.redeem,unit.default_text,identity_id`;
        var aAllActiveDimenisonResult = oHQ.statement(sSelectAllActiveDimenison).execute(sUserId);
        if(aAllActiveDimenisonResult.length > 0){
            aAllActiveDimenisonResult.forEach(function(item){
                
                var consumedValueForDimension = Dimension.getUserConsumedValueForDimension(sUserId, item.ID, oHQ);
                
                aGamification.push({
                    ID:item.ID,
                    DIMENSION_NAME:item.NAME,
                    TOTAL: parseInt(item.TOTAL),
                    UNIT:item.DIMENSION_UNIT,
                    REDEEM: item.REDEEM,
                    TOTAL_FOR_REDEEM: item.REDEEM ? item.TOTAL - consumedValueForDimension : 0,
                    CONSUMED_VALUE: consumedValueForDimension
                })
            })
        }
        return aGamification
    }
    
    
}
