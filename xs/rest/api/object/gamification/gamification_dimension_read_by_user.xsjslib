var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Dimension = $.import("sap.ino.xs.object.gamification", "Dimension");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function gamification_dimension_read_by_user(oRequest, return_inf) {
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

	var aUsername = oRequest.Parameters.Username ? oRequest.Parameters.Username : [] ;
	var aGamification = [];
    if(aUsername instanceof Array){
        
        if(aUsername.length > 100){
            errorMessages = {
			"STATUS": "The length of Username Array you input should not exceed 100 "
		};
        	$.response.status = 400;
            util.handlError(return_inf, oRequest, errorMessages, $.response);
					return false;
        }
        
        aUsername.forEach(function(username){
            var oUser = util.getUserByUsername(username, oHQ);
            if(oUser !== null){
                var aUserProfileForGamification = getUserProfileForGamification(oUser.ID, oHQ);
                oUser.GamificationInfo = aUserProfileForGamification;
                aGamification.push(oUser)
            }
        });
    }else{
         errorMessages = {
			"STATUS": "The Username you input is not an Array "
		};
	$.response.status = 400;
    util.handlError(return_inf, oRequest, errorMessages, $.response);
					return false;
    }
	
	var oResponse = util.get_inf(oRequest, return_inf, undefined, aGamification);
	util.send_mes(oResponse);

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
