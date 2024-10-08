/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/comp/library","sap/ui/base/ManagedObject","sap/m/Token","sap/m/library","sap/ui/comp/util/FormatUtil"],function(l,M,T,L,F){"use strict";var V=l.valuehelpdialog.ValueHelpRangeOperation;var P=L.P13nConditionOperation;var a=function(d){this._sDefaultOperation=d;this._aKeyFields=[];this._mTypeOperations={"default":[P.EQ,P.BT,P.LT,P.LE,P.GT,P.GE,"NE"],"string":[P.Empty,"ExcludeEmpty",P.Contains,P.EQ,P.BT,P.StartsWith,P.EndsWith,P.LT,P.LE,P.GT,P.GE,"NE"],"date":[P.EQ,P.BT,P.LT,P.LE,P.GT,P.GE,"NE"],"time":[P.EQ,P.BT,P.LT,P.LE,P.GT,P.GE,"NE"],"numeric":[P.EQ,P.BT,P.LT,P.LE,P.GT,P.GE,"NE"],"numc":[P.Contains,P.EQ,P.BT,P.EndsWith,P.LT,P.LE,P.GT,P.GE,"NE"],"boolean":[P.EQ]};this._init();};function p(t){var v=this.re.exec(t),s=v[1],b=v[2];if(v){if(s&&s.trim){s=s.trim();}if(b&&b.trim){b=b.trim();}return[s,b];}return[];}a.rangeOperations={};a.rangeOperations[P.Empty]={regex:new RegExp("^"+F.getFormattedRangeText(V.Empty,null,null,false)+"$","i"),operator:P.Empty,example:F.getFormattedRangeText(V.Empty,null,null,false),template:F.getFormattedRangeText(V.Empty,null,null,false),exclude:false,parse:function(t){return[];}};a.rangeOperations[P.BT]={regex:/^([^!].*)\.\.\.(.+)$/,operator:P.BT,example:"foo...bar",template:"$0...$1",exclude:false,parse:p};a.rangeOperations[P.EQ]={regex:/^\=(.+)$/,operator:P.EQ,example:"=foo",template:"=$0",exclude:false};a.rangeOperations[P.Contains]={regex:/^\*(.+)\*$/,operator:P.Contains,example:"*foo*",template:"*$0*",exclude:false};a.rangeOperations[P.StartsWith]={regex:/^([^\*!].*)\*$/,operator:P.StartsWith,example:"foo*",template:"$0*",exclude:false};a.rangeOperations[P.EndsWith]={regex:/^\*(.*[^\*])$/,operator:P.EndsWith,example:"*foo",template:"*$0",exclude:false};a.rangeOperations[P.LT]={regex:/^\<([^\=].*)$/,operator:P.LT,example:"< foo",template:"<$0",exclude:false};a.rangeOperations[P.LE]={regex:/^\<\=(.+)$/,operator:P.LE,example:"<=foo",template:"<=$0",exclude:false};a.rangeOperations[P.GT]={regex:/^\>([^\=].*)$/,operator:P.GT,example:"> foo",template:">$0",exclude:false};a.rangeOperations[P.GE]={regex:/^>=(.+)$/,operator:P.GE,example:">=foo",template:">=$0",exclude:false};a.rangeOperations["ExcludeEmpty"]={regex:new RegExp("^"+F.getFormattedRangeText(V.Empty,null,null,true).replace("(","\\(").replace(")","\\)")+"$","i"),operator:"ExcludeEmpty",example:F.getFormattedRangeText(V.Empty,null,null,true),template:F.getFormattedRangeText(V.Empty,null,null,true),exclude:true,parse:function(t){return[];}};a.rangeOperations[P.NotBT]={regex:/^![(]?(.+)\.\.\.([^)]+)[)]?$/,operator:P.NotBT,example:"!foo...bar",template:"!($0...$1)",exclude:true,parse:p};a.rangeOperations["NE"]={regex:/^![(]?=(.+?)[)]?$/,operator:"NE",example:"!=foo",template:"!(=$0)",exclude:true};a.excludeOperationsMapping={};a.excludeOperationsMapping["NE"]=P.EQ;a.excludeOperationsMapping["ExcludeEmpty"]=P.Empty;a.prototype._init=function(){this.createOperation(a.rangeOperations[P.Empty]);this.createOperation(a.rangeOperations[P.BT]);this.createOperation(a.rangeOperations[P.EQ]);this.createOperation(a.rangeOperations[P.Contains]);this.createOperation(a.rangeOperations[P.StartsWith]);this.createOperation(a.rangeOperations[P.EndsWith]);this.createOperation(a.rangeOperations[P.LT]);this.createOperation(a.rangeOperations[P.LE]);this.createOperation(a.rangeOperations[P.GT]);this.createOperation(a.rangeOperations[P.GE]);this.createOperation(a.rangeOperations["NE"]);this.createOperation(a.rangeOperations["ExcludeEmpty"]);};a.prototype.destroy=function(){if(this._oInput&&!this._oInput.bIsDestroyed){this._oInput.removeValidator(this._validator);if(this._aOrgValidators&&this._aOrgValidators.length>0){this._oInput.addValidator(this._aOrgValidators);}this._oInput=null;}this._aOrgValidators=null;this._aKeyFields=null;this._mTypeOperations=null;};a.prototype.setDefaultOperation=function(o){this._sDefaultOperation=o;};a.prototype.getDefaultOperation=function(){return this._sDefaultOperation;};a.prototype.getOperations=function(){return this._mOperations;};a.prototype.getOperation=function(o){return this._mOperations&&this._mOperations[o];};a.prototype._getKeyFieldByLabel=function(s){var k;this._aKeyFields.some(function(K){if(K.label.toUpperCase()===s.toUpperCase()){k=K;}},this);return k;};a.prototype.addKeyField=function(k){this._aKeyFields.push(k);};a.prototype.getKeyFields=function(){return this._aKeyFields;};a.prototype.addTypeOperations=function(t,o){this._mTypeOperations[t]=o;};a.prototype.removeTypeOperations=function(t){delete this._mTypeOperations[t];};a.prototype.getTypeOperations=function(t){return this._mTypeOperations[t]||this._mTypeOperations["default"];};a.prototype.createOperation=function(o){var O=o.operator,e=o.example,r=o.regex,t=o.template,f=o.parse,E=o.exclude;if(!this._mOperations){this._mOperations={};}this._mOperations[O]={key:O,example:e,re:r,template:t,exclude:E,parser:this,match:function(s,k){var b=this.re.exec(s);if(b){var v=this.parse(s);if(k){v.forEach(function(c){if(k.hasOwnProperty("maxLength")&&k.maxLength>=0&&c.length>k.maxLength){b=null;}if(k.oType){try{c=k.oType.parseValue(c,"string");k.oType.validateValue(c);}catch(d){b=null;}}},this);}}return b;},parse:f||function(s){var v=this.re.exec(s);if(v){var b=v[1]||v[2];if(b&&b.trim){b=b.trim();}return[b];}return[];},getFilledTemplate:function(s,k){var v=this.parse(s);var b=[];var c="";for(var i=0;i<v.length;i++){b[i]=this.formatValue(v[i],false,k);}c=a._templateReplace(this.template,b);return c;},getConditionData:function(s,k){var b={};b.exclude=this.exclude;if(this.exclude){b.operation=a.excludeOperationsMapping[this.key];if(!b.operation){b.operation=this.key;}}else{b.operation=this.key;}var v=this.parse(s);for(var i=0;i<v.length;i++){b["value"+(i+1)]=this.formatValue(v[i],true,k);}return b;},formatValue:function(v,b,k){if(!k){return v;}if(k.hasOwnProperty("maxLength")){if(k.maxLength>=0){v=v.substring(0,k.maxLength);}}if(k.displayFormat){if(k.displayFormat==="UpperCase"){v=v.toUpperCase();}}if(k.oType){try{v=k.oType.parseValue(v,"string");k.oType.validateValue(v);}catch(c){return"ERROR";}if(!b){v=k.oType.formatValue(v,"string");}}return v;}};return this._mOperations[O];};a.prototype.removeOperation=function(o){delete this._mOperations[o];};a.prototype.removeAllOperations=function(){var o=Object.keys(this._mOperations);o.forEach(function(b){delete this._mOperations[b];},this);};a.prototype.getTranslatedText=function(t,o,r){var s=o.key;t=t!=="default"?"_"+t.toUpperCase()+"_":"";if(t==="_STRING_"||t==="_BOOLEAN_"||t==="_NUMC_"){t="";}if(t==="_TIME_"){t="_DATE_";}if(!r){r="sap.m";}s="CONDITIONPANEL_OPTION"+t+s;var b=sap.ui.getCore().getLibraryResourceBundle(r).getText(s)||s;if(b.startsWith("CONDITIONPANEL_OPTION")){s="CONDITIONPANEL_OPTION"+o.key;b=sap.ui.getCore().getLibraryResourceBundle(r).getText(s);}return b;};a.prototype.associateInput=function(i){this._oInput=i;this._aOrgValidators=this._oInput&&this._oInput.isA('sap.m.MultiInput')?this._oInput._tokenizer._aTokenValidators.slice():[];this._oInput.removeAllValidators();this._oInput.addValidator(this._validator.bind(this));};a.prototype._validator=function(b){if(this._aOrgValidators){var t;this._aOrgValidators.some(function(v){t=v(b);return t;},this);if(t){return t;}}if(b.text){return this._onValidate(b.text);}return null;};a._templateReplace=function(t,v){return t.replace(/\$\d/g,function(m){return v[parseInt(m.substr(1))];});};a.prototype._onValidate=function(t){var k=this._aKeyFields.length>0?this._aKeyFields[0]:null;if(this._oInput._getIsSuggestionPopupOpen&&this._oInput._getIsSuggestionPopupOpen()&&this._oInput._oSuggestionTable&&this._oInput._oSuggestionTable.getSelectedItem()){return null;}if(k){var b=/^\w+\:\s/.exec(t);if(b){var K=b[0];k=this._getKeyFieldByLabel(K.slice(0,K.indexOf(":")));if(k){t=t.slice(b[0].length).trim();}}}var c=k&&k.type||"default";var d=this.getTypeOperations(c);var C=function(o,t){if(o.match(t,k)){var r=o.getConditionData(t,k);r.keyField=k?k.key:null;if(k.hasOwnProperty("maxLength")&&k.maxLength===1){if([P.Contains,P.EndsWith,P.StartsWith].indexOf(o.key)!==-1){return;}}if(c==="numc"){if([P.Contains,P.EndsWith].indexOf(o.key)!==-1){r.value1=k.oType.formatValue(r.value1,"string");}}var s=(k&&k.label&&this._aKeyFields.length>1?k.label+": ":"")+o.getFilledTemplate(t,k);s=M.escapeSettingsValue(s);return new T({text:s,tooltip:s}).data("range",r);}return null;}.bind(this);var e;if(d.some(function(o){e=C(this._mOperations[o],t);return e;},this)){return e;}if(this._sDefaultOperation&&this._mOperations[this._sDefaultOperation]){t=a._templateReplace(this._mOperations[this._sDefaultOperation].template,[t]);return C(this._mOperations[this._sDefaultOperation],t);}return null;};a._createRangeByText=function(t){var o=a._matchOperationFromText(t);if(!o){return{"exclude":false,"operation":P.EQ,"tokenText":null,"value1":t,"value2":null};}var c=o;var e=false;if(a.excludeOperationsMapping[o]){c=a.excludeOperationsMapping[o];e=true;}var m=c===P.BT?true:false;return a._getRangeByTextAndOperation(t,c,e,m);};a._matchOperationFromText=function(t){var m=[];for(var o in a.rangeOperations){if(a.rangeOperations[o].regex.test(t)){m.push(o);}}if(m.length===0){return null;}if(m.length>1){if(t===F.getFormattedRangeText(V.Empty,null,null,false)&&m.indexOf(a.rangeOperations[P.Empty].operator)>-1){m=[a.rangeOperations[P.Empty].operator];}if(t===F.getFormattedRangeText(V.Empty,null,null,true)&&m.indexOf(a.rangeOperations["ExcludeEmpty"].operator)>-1){m=[a.rangeOperations["ExcludeEmpty"].operator];}if(m.indexOf(a.rangeOperations[P.NotContains].operator)>-1&&m.indexOf(a.rangeOperations[P.NotStartsWith].operator)>-1){return a.rangeOperations[P.NotContains].operator;}}return m[0];};a._getRangeByTextAndOperation=function(t,o,e,m){var v=[];if(e&&t.startsWith("!(")&&t.endsWith(")")){t=t.slice(2,-1);}var s=a.rangeOperations[o].template;if(m){v=t.split("...");return{"exclude":e,"operation":o,"value1":v[0],"value2":v[1]};}else{var S=s.indexOf("$0");var E=S+2;if(E===s.length){t=t.slice(S);}else{E=(s.length-E);t=t.slice(S,-E);}return{"exclude":e,"operation":o,"value1":t,"value2":null};}};return a;},true);
