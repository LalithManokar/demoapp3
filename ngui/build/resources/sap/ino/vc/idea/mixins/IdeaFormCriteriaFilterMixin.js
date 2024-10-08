sap.ui.define(["sap/ino/commons/application/Configuration","sap/ui/core/format/DateFormat","sap/ino/commons/models/types/StringBooleanType"],function(C,D,S){var I=function(){throw"Mixin may not be instantiated directly";};var a=D.getInstance({pattern:"YYYY-MM-dd"});var O={empty:{TEXT:"",ACTION:-1},eq:{TEXT:"OPERATOR_MIT_EQ",ACTION:0},ge:{TEXT:"OPERATOR_MIT_GE",ACTION:1},le:{TEXT:"OPERATOR_MIT_LE",ACTION:2},like:{TEXT:"OPERATOR_MIT_LIKE",ACTION:3}};var b={"BOOLEAN":1,"INTEGER":2,"NUMERIC":2,"DATE":4,"TEXT":8,"RICHTEXT":8,"VALUEOPTIONLIST":16};var c={"BOOLEAN":[O.eq],"INTEGER":[O.eq,O.ge,O.le],"NUMERIC":[O.eq,O.ge,O.le],"DATE":[O.eq,O.ge,O.le],"TEXT":[O.like],"RICHTEXT":[O.like]};function s(p,i,v){var o=[O.eq];if(!i){o=[O.empty];}else if(!v){o=c[i];}var j=this.getFilterItem(p+"/CriteriaOp");if(!this.getFilterItem(p+"/CriteriaOp")){j=o[0].ACTION;}this.setFilterItem(p+"/IdeaFormOperator",o);this.setFilterItem(p+"/CriteriaOp",j);}function d(p,i,v){var j=-1;if(v){i="VALUEOPTIONLIST";}if(i){j=b[i];}this.setFilterItem(p+"/CriteriaValueDataType",j);}function g(v){var i=new jQuery.Deferred();var M=this.getDefaultODataModel?this.getDefaultODataModel():this.getModel("data");var p=C.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")?"/StagingValueOptions":"/ValueOptions";M.read(p,{urlParameters:{"$orderby":"SEQUENCE_NO","$filter":"LIST_CODE eq '"+v+"'"},success:function(o){var r=o.results;r.unshift({CODE:"",DEFAULT_TEXT:""});i.resolve(r);}});return i.promise();}function e(p,v){var t=this;if(!v){if(p){this.setFilterItem(p+"/CriteriaValueList",[]);}return;}g.call(this,v).then(function(r){t.setFilterItem(p+"/CriteriaValueList",r);});}function f(){var r=[];r.unshift({CODE:"",DATATYPE_CODE:"",DEFAULT_TEXT:""});this.setFilterItem("/IdeaFormList",r);}function h(){this.setFilterItem("/IdeaFormCriterias",[{CriteriaID:0,CriteriaCode:'',CriteriaOp:-1,CriteriaType:-1,CriteriaValue:undefined,CriteriaValueCode:undefined,IdeaFormOperator:[],CriteriaValueDataType:0,CriteriaValueList:[],CriteriaTime:new Date().getTime()}]);}function k(){var i=this.getFilterItem("/CAMPAIGNFORM");var j=this.getViewProperty("/List/CAMPAIGN");var o=new jQuery.Deferred();if(!i&&!j){o.resolve();return o.promise();}var p=C.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");var M=this.getDefaultODataModel?this.getDefaultODataModel():this.getModel("data");M.read("/IdeaFormFieldSuggestionParams(CampaignID="+(j||-1)+",FormID='"+(i||"")+"',filterBackoffice="+(p?1:0)+")/Results",{success:function(q){var r=jQuery.extend(true,{},q).results;r.unshift({CODE:"",DATATYPE_CODE:"",DEFAULT_TEXT:""});o.resolve(r);}});return o.promise();}function l(q){var t=this;var o=[],p=t.getFilterItem("/IdeaFormList");for(var r=1;r<=3;r++){if(q.hasOwnProperty("c"+r)){o.push({CriteriaID:r-1,CriteriaCode:q["c"+r],CriteriaOp:q["o"+r],CriteriaType:q["t"+r],CriteriaValue:q["v"+r],CriteriaValueCode:q["vc"+r],IdeaFormOperator:[],CriteriaValueDataType:q["vdt"+r],CriteriaValueList:[],CriteriaTime:new Date().getTime()});}}o[0].CriteriaValue=decodeURIComponent(o[0].CriteriaValue);t.setFilterItem("/IdeaFormCriterias",o);function u(){p=t.getFilterItem("/IdeaFormList");for(var i=0;i<o.length;i++){for(var j=0;j<p.length;j++){if(p[j].CODE===o[i].CriteriaCode){s.call(t,"/IdeaFormCriterias/"+i,p[j].DATATYPE_CODE,p[j].VALUE_OPTION_LIST_CODE);d.call(t,"/IdeaFormCriterias/"+i,p[j].DATATYPE_CODE,p[j].VALUE_OPTION_LIST_CODE);e.call(t,"/IdeaFormCriterias/"+i,p[j].VALUE_OPTION_LIST_CODE);}}}}if(!p){k.call(t).then(function(R){t.setFilterItem("/IdeaFormList",R);u();});}else{u();}}function m(v){var r=JSON.stringify(new Date(v+" 00:00:00"));return r.replace(/"/g,"");}function n(i){if(this.getFilterItem("/IdeaFormCriterias/"+i+"/CriteriaValueDataType")===4&&!!this.getFilterItem("/IdeaFormCriterias/"+i+"/CriteriaValue")){return m.call(this,this.getFilterItem("/IdeaFormCriterias/"+i+"/CriteriaValue"));}return this.getFilterItem("/IdeaFormCriterias/"+i+"/CriteriaValue")||"";}I.hasIdeaformFilters=function(){var i=this.getFilterItem("/IdeaFormCriterias");if(!i||i.length<=0){return false;}return i[0].CriteriaCode;};I.initIdeaFormItems=function(q){if(!q||!q.hasOwnProperty("c1")){h.call(this);return;}l.call(this,q);};I.getIdeaformQuery=function(q){var i=this.getFilterItem("/IdeaFormCriterias");if(!i||i.length<=0){return;}for(var j=0;j<3;j++){if(j>i.length-1||!this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaCode")){continue;}q["c"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaCode");q["o"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaOp");q["v"+(j+1)]=n.call(this,j);}};I.getEmptyIdeaformFilters=function(){return",c1='',o1=-1,v1='',c2='',o2=-1,v2='',c3='',o3=-1,v3=''";};I.setQueryObjectIdeaformFilters=function(p){var i=this.getFilterItem("/IdeaFormCriterias");for(var j=0;j<3;j++){p["c"+(j+1)]='';p["o"+(j+1)]=-1;p["v"+(j+1)]='';}if(!i||i.length<=0){return;}for(j=0;j<3;j++){if(j>i.length-1||!this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaCode")){continue;}p["c"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaCode");p["o"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaOp");p["v"+(j+1)]=encodeURIComponent(n.call(this,j));}};I.getIdeaformFilters=function(){var i=this.getFilterItem("/IdeaFormCriterias");if(!i||i.length<=0){return this.getEmptyIdeaformFilters();}var r="";for(var j=0;j<3;j++){if(j>i.length-1||!this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaCode")){r+=",c"+(j+1)+"=''";r+=",o"+(j+1)+"=-1";r+=",v"+(j+1)+"=''";continue;}r+=",c"+(j+1)+"='"+this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaCode")+"'";r+=",o"+(j+1)+"="+this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaOp");r+=",v"+(j+1)+"='"+encodeURIComponent(n.call(this,j))+"'";}return r;};I.setIdeaformCriteriaToQuery=function(q){var i=this.getFilterItem("/IdeaFormCriterias");if(!i||i.length<=0||!i[0].CriteriaCode){return;}for(var j=0;j<i.length;j++){q["c"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaCode");q["o"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaOp");q["v"+(j+1)]=encodeURIComponent(this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaValue"));q["vc"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaValueCode");q["vdt"+(j+1)]=this.getFilterItem("/IdeaFormCriterias/"+j+"/CriteriaValueDataType");}};I.restIdeaFormFieldsCriterias=function(){f.call(this);h.call(this);};I.clearIdeaFormFieldsCriterias=function(){f.call(this);h.call(this);};I.getIdeaFormFieldsCriterias=function(){var t=this;k.call(t).then(function(r){t.setFilterItem("/IdeaFormList",r);});};I.CriteriaCodeChange=function(E){var o=E.getSource();var i=E.getParameter("selectedItem").getAggregation("customData");var j=i[0].getProperty("value");var v=i[1].getProperty("value");var p=o.getBinding("selectedKey").getContext().sPath;s.call(this,p,j,v);d.call(this,p,j,v);e.call(this,p,v);this.setFilterItem(p+"/CriteriaValue",(j==="BOOLEAN"?"0":""));this.setFilterItem(p+"/CriteriaValueCode","");};I.onAddCriteriaFilter=function(){var i=this.getFilterItem("/IdeaFormCriterias");i.push({CriteriaID:i.length,CriteriaCode:'',CriteriaOp:-1,CriteriaType:-1,CriteriaValue:undefined,CriteriaValueCode:undefined,IdeaFormOperator:[],CriteriaValueDataType:0,CriteriaValueList:[],CriteriaTime:new Date().getTime()});this.setFilterItem("/IdeaFormCriterias",i);for(var j=0;j<i.length;j++){this.setFilterItem("/IdeaFormCriterias/"+j+"/CriteriaTime",new Date().getTime());}};I.onRemoveCriteriaFilter=function(){var i=this.getFilterItem("/IdeaFormCriterias");i.pop();this.setFilterItem("/IdeaFormCriterias",i);for(var j=0;j<i.length;j++){this.setFilterItem("/IdeaFormCriterias/"+j+"/CriteriaTime",new Date().getTime());}};I.onDataPickerCriteriaValueChange=function(E){var p=E.getSource().getBindingInfo("value").binding.getContext().sPath;this.setFilterItem(p+"/CriteriaValue",a.format(E.getSource().getDateValue()));};I.onCriteriaValueCodeChange=function(E){var p=E.getSource().getBindingInfo("selectedKey").binding.getContext().sPath;var i='',v=this.getFilterItem(p+"/CriteriaValueList"),j={"BOOLEAN":"BOOL_VALUE","INTEGER":"NUM_VALUE","NUMERIC":"NUM_VALUE","TEXT":"TEXT_VALUE"};if(v){for(var o=0;o<v.length;o++){if(v[o].CODE===this.getFilterItem(p+"/CriteriaValueCode")&&j.hasOwnProperty(v[o].DATATYPE_CODE)){i=v[o][j[v[o].DATATYPE_CODE]];break;}}}this.setFilterItem(p+"/CriteriaValue",i);};I.addCriteriaFilterFormatter=function(i,j,o){return i&&i.length<3&&i.length-1===j&&o>0;};I.removeCriteriaFilterFormatter=function(i,j,o){return i&&i.length>1&&i.length-1===j&&o>0;};I.campaignIdeaFormFormatter=function(i,j,o,p){if(!p){return false;}if(!i&&!j){return false;}return o&&o.length>1;};return I;});
