/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/library','sap/ui/comp/library','sap/m/library','sap/m/Column','sap/m/ColumnListItem','sap/m/Text','sap/m/Token','./BaseValueListProvider','sap/ui/core/Item','sap/ui/model/Filter','sap/ui/model/Sorter','sap/ui/model/json/JSONModel','sap/ui/model/FilterOperator','sap/ui/comp/util/FormatUtil','sap/ui/comp/smartfilterbar/FilterProvider','sap/ui/Device','sap/base/Log'],function(c,l,L,C,a,T,b,B,I,F,S,J,d,e,f,D,g){"use strict";var h=l.smartfilterbar.DisplayBehaviour;var P=L.PopinDisplay;var W=L.WrappingType;var V=c.ValueState;var j=B.extend("sap.ui.comp.providers.ValueListProvider",{constructor:function(p){if(!f){f=sap.ui.require("sap/ui/comp/smartfilterbar/FilterProvider");}if(p){this.sAggregationName=p.aggregation;this.bTypeAheadEnabled=!!p.typeAheadEnabled;this.bEnableShowTableSuggestionValueHelp=p.enableShowTableSuggestionValueHelp===undefined?true:p.enableShowTableSuggestionValueHelp;this.dropdownItemKeyType=p.dropdownItemKeyType;this.sDeferredGroupId=p.deferredGroupId;this.sContext=p.context;}B.apply(this,arguments);this._onInitialise();}});j.prototype._onInitialise=function(){if(!this.bTypeAheadEnabled){this.oAfterRenderingEventDelegate={onAfterRendering:this._onMetadataInitialised};this.oControl.addEventDelegate(this.oAfterRenderingEventDelegate,this);}else if(this.oControl.attachSuggest){this._fSuggest=function(E){this.oControl=E.getSource();if(!this.bInitialised){return;}if(!this.oTemplate||!this.oControl.data("_hassuggestionTemplate")){this._createSuggestionTemplate();}var i=E.getParameter("suggestValue");this._fetchData(i);}.bind(this);this.oControl.attachSuggest(this._fSuggest);if(!this.oFilterModel){var t=this;var s=this.oControl.setParent;this.oControl.setParent=function(n,A,i){var o=this.getParent();var r=s.apply(this,arguments);n=this.getParent();var k=!(n&&(o===null));if((n!==o)&&k){t.unbindAggregation();}return r;};}this._handleSelect();}};j.prototype._onMetadataInitialised=function(){if(this.bInitialised){if(this.oAfterRenderingEventDelegate){this.oControl.removeEventDelegate(this.oAfterRenderingEventDelegate);}if(this.oPrimaryValueListAnnotation){if(this.sAggregationName&&this.sAggregationName=="suggestionRows"){this._createSuggestionTemplate();}else{this._createDropDownTemplate();}this._fetchData();}else{g.error("ValueListProvider","Missing primary ValueListAnnotation for "+(this._sFullyQualifiedFieldName||this.sFieldName));}if(this.oAfterRenderingEventDelegate){delete this.oAfterRenderingEventDelegate;}}};j.prototype._isSortable=function(n){if(this.oPrimaryValueListAnnotation){for(var i=0;i<this.oPrimaryValueListAnnotation.valueListFields.length;i++){if(this.oPrimaryValueListAnnotation.valueListFields[i].name===n){return this.oPrimaryValueListAnnotation.valueListFields[i].sortable!==false;}}return false;}return false;};j.prototype._createDropDownTemplate=function(){this._oTemplate=new I({key:{path:this.sKey,type:this.dropdownItemKeyType},text:{parts:[{path:this.sKey,type:this.dropdownItemKeyType},{path:this.sDescription}],formatter:e.getFormatterFunctionFromDisplayBehaviour(this.sDDLBDisplayBehaviour)}});this._oSorter=null;if(this.sDDLBDisplayBehaviour===h.idOnly||this.sDDLBDisplayBehaviour===h.idAndDescription){if(this._isSortable(this.sKey)){this._oSorter=new S(this.sKey);}}else{if(this._isSortable(this.sDescription)){this._oSorter=new S(this.sDescription);}else if((this.sDescription!==this.sKey)&&this._isSortable(this.sKey)){this._oSorter=new S(this.sKey);}}};j.prototype._createSuggestionTemplate=function(){var i=0,k=0,s=0;this._oTemplate=new a();if(this._aCols){this.oControl.removeAllSuggestionColumns();k=this._aCols.length;for(i=0;i<k;i++){var m=false,M="1px",w=this._aCols[i].width;if(D.system.phone){w=undefined;if(i>=2){m=true;M=(i+1)*10+"rem";}}this.oControl.addSuggestionColumn(new C({header:new T({wrapping:true,wrappingType:W.Hyphenated,text:this._aCols[i].label}),demandPopin:m,popinDisplay:P.Inline,minScreenWidth:M,width:w}));this._oTemplate.addCell(new T({wrapping:true,text:{path:this._aCols[i].template,type:this._aCols[i].oType}}));if(w){s+=parseFloat(w.substring(0,w.length-2));}}if(s>0){this.oControl.setProperty('maxSuggestionWidth',s+k+"em",true);}}this.oControl.data("_hassuggestionTemplate",true);};j.prototype._handleRowSelect=function(o,i){var k,t,m;if(o){k=o[this.sKey];t=o[this.sDescription];}if(k||(k==="")){if(this.oControl.addToken){t=e.getFormattedExpressionFromDisplayBehaviour(this.sTokenDisplayBehaviour,k,t);m=new b();m.setKey(k);m.setText(t);m.setTooltip(t);m.data("row",o);if(i){i(m);}if(this.oControl.getValue()===""){this.oControl.setValue("");}delete this.oControl.__sValidationText;}else{this.oControl.setValue(k);this.oControl.fireChange({value:k,validated:true});}}this._calculateAndSetFilterOutputData([o]);};j.prototype._multiInputValidator=function(o){if(!this.bInitialised){return;}if(this._aValidators){var t;this._aValidators.some(function(v){t=v(o);return t;},this);if(t){return t;}}var r=o.suggestionObject,i,s=o.text;if(r){var m=r.getModel();i=m.getData(r.getBindingContextPath());this._handleRowSelect(i,o.asyncCallback);}else if(s){this._validateInput(s,o.asyncCallback);}};j.prototype._validateInput=function(i,A){var k=[],o=this.oControl,p;if(this.sDisplayFormat==="UpperCase"){i=i.toUpperCase();}if(o.__sValidationText!==i){o.__sValidationText=i;if(i===this._truncateSearchText(i)){o.__bValidatingToken=true;this._calculateFilterInputData();if(this.mFilterInputData&&this.aFilterField){k=f.generateFilters(this.aFilterField,this.mFilterInputData);}k.push(new F(this.sKey,d.EQ,i));if(this.bSupportBasicSearch){p={"search-focus":this.sKey};}this.oODataModel.read("/"+this.sValueListEntitySetName,{filters:k,urlParameters:p,success:function(r){if(!this.oControl||!this.oControl.hasOwnProperty("__bValidatingToken")){return;}var R=r;delete this.oControl.__bValidatingToken;if(r){if(r.results&&r.results.length>=1){if(r.results.length===1){R=r.results[0];}if(this.oControl.data("__validationError")){this.oControl.data("__validationError",null);this.oControl.setValueState("None");}}else{this.oControl.setValueState("Error");this.oControl.data("__validationError",true);}if(R&&R[this.sKey]){this._handleRowSelect(R,A);}}this._afterTokenValidate();}.bind(this),error:function(){if(this.oControl.data("__validationError")){this.oControl.setValueState("None");}delete this.oControl.__bValidatingToken;this._afterTokenValidate();}.bind(this)});}}else{if(o.data("__validationError")){o.setValueState(V.Error);}}};j.prototype._validateStringSingleWithValueList=function(E){var v;if(E.getParameter("validated")){return;}v=E.getParameter("value");if(v===""||v===undefined){return;}this._validateInput(v);};j.prototype._afterTokenValidate=function(){if(this.oFilterProvider&&this.oFilterProvider._oSmartFilter&&this.oFilterProvider._oSmartFilter.bIsSearchPending&&this.oFilterProvider._oSmartFilter.search){if(this.oFilterProvider._oSmartFilter.getLiveMode&&this.oFilterProvider._oSmartFilter.getLiveMode()){return;}this.oFilterProvider._oSmartFilter.search();}};j.prototype._onSuggestionItemSelected=function(E){var r=E.getParameter("selectedRow");if(r){this._handleRowSelect(r.getModel().getData(r.getBindingContextPath()));}};j.prototype._handleSelect=function(){if(this.oControl.addValidator){this._aValidators=this.oControl._tokenizer?this.oControl._tokenizer._aTokenValidators.slice():[];this.oControl.removeAllValidators();this._fValidator=this._multiInputValidator.bind(this);this.oControl.addValidator(this._fValidator);}else if(this.oControl.attachSuggestionItemSelected){this.oControl.attachSuggestionItemSelected(this._onSuggestionItemSelected,this);if(this.sContext==="SmartFilterBar"&&this._fieldViewMetadata&&this._fieldViewMetadata.hasValueListAnnotation){this.oControl.attachChange(this._validateStringSingleWithValueList,this);}}this.oControl.setRowResultFunction(function(s){var o,r="";if(s){o=s.getBindingContext();}if(o&&this.sKey){r=o.getProperty(this.sKey);}return r;}.bind(this));};j.prototype._fetchData=function(s){var p={},i=[],k,E;if(this.bTypeAheadEnabled){if(s&&this.sDisplayFormat==="UpperCase"){s=s.toUpperCase();}if(this.bSupportBasicSearch){p["custom"]={"search-focus":this.sKey,"search":s};}this._calculateFilterInputData();if(this.mFilterInputData&&this.aFilterField){i=f.generateFilters(this.aFilterField,this.mFilterInputData,{dateSettings:this._oDateFormatSettings});}if(!this.bSupportBasicSearch){if(this._sType==="numc"){i.push(new F(this.sKey,d.Contains,s));}else if(this._truncateSearchText(s)===s){i.push(new F(this.sKey,d.StartsWith,s));}else{this.oControl.closeSuggestions();return;}}k=10;if(this.bEnableShowTableSuggestionValueHelp){E={dataReceived:function(o){var m=o.getSource(),n;if(m){n=m.getLength();if(n&&n<=k){this.oControl.setShowTableSuggestionValueHelp(false);}else{this.oControl.setShowTableSuggestionValueHelp(true);}}}.bind(this)};}else{this.oControl.setShowTableSuggestionValueHelp(false);}}if(this.aSelect&&this.aSelect.length){p["select"]=this.aSelect.toString();}if(!this.sValueListEntitySetName){g.error("ValueListProvider","Empty sValueListEntitySetName for "+this.sAggregationName+" binding! (missing primaryValueListAnnotation)");}if(this.sDeferredGroupId){p["batchGroupId"]=this.sDeferredGroupId;}this.oControl.bindAggregation(this.sAggregationName,{path:"/"+this.sValueListEntitySetName,length:k,parameters:p,filters:i,sorter:this._oSorter,events:E,template:this._oTemplate,templateShareable:false});};j.prototype._truncateSearchText=function(s){var m=-1;if(this._sMaxLength){m=parseInt(this._sMaxLength);}else if(this._fieldViewMetadata&&this._fieldViewMetadata.maxLength){m=parseInt(this._fieldViewMetadata.maxLength);}if(m>-1&&s.length>m){s=s.substr(0,m);}return s;};j.prototype.unbindAggregation=function(){if(this.oControl){this.oControl.unbindAggregation(this.sAggregationName);}return this;};j.prototype.destroy=function(){if(this.oControl){if(this.oControl.detachSuggest&&this._fSuggest){this.oControl.detachSuggest(this._fSuggest);this._fSuggest=null;}if(this.oControl.removeValidator&&this._fValidator){this.oControl.removeValidator(this._fValidator);this._fValidator=null;}else if(this.oControl.detachSuggestionItemSelected){this.oControl.detachSuggestionItemSelected(this._onSuggestionItemSelected,this);}if(this.oControl.detachChange){this.oControl.detachChange(this._validateStringSingleWithValueList,this);}this.oControl.unbindAggregation(this.sAggregationName);this.oControl.data("_hassuggestionTemplate",false);delete this.oControl.__sValidationText;delete this.oControl.__bValidatingToken;}B.prototype.destroy.apply(this,arguments);if(this.oJsonModel){this.oJsonModel.destroy();this.oJsonModel=null;}if(this._oTemplate){this._oTemplate.destroy();}this._oTemplate=null;this.sAggregationName=null;this.bTypeAheadEnabled=null;this._oSorter=null;};return j;},true);
