/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/format/NumberFormat","sap/ui/core/format/DateFormat","sap/m/P13nConditionPanel","sap/ui/comp/odata/ODataType"],function(N,D,P,O){"use strict";var F={getFormattedExpressionFromDisplayBehaviour:function(d,i,s){return F.getFormatterFunctionFromDisplayBehaviour(d)(i,s);},getFormatterFunctionFromDisplayBehaviour:function(d){switch(d){case"descriptionAndId":return F._getTextFormatterForDescriptionAndId;case"idAndDescription":return F._getTextFormatterForIdAndDescription;case"descriptionOnly":return F._getTextFormatterForDescriptionOnly;default:return F._getTextFormatterForIdOnly;}},_processText:function(t,p){if(p){return t;}return t.secondText?t.firstText+" ("+t.secondText+")":t.firstText;},_getTextFormatterForDescriptionAndId:function(i,d,p){return F._processText({firstText:d?d:i,secondText:d?i:undefined},p);},_getTextFormatterForIdAndDescription:function(i,d,p){return F._processText({firstText:i,secondText:d?d:undefined},p);},_getTextFormatterForDescriptionOnly:function(i,d,p){return F._processText({firstText:d,secondText:undefined},p);},_getTextFormatterForIdOnly:function(i,d,p){return F._processText({firstText:i,secondText:undefined},p);},getTextsFromDisplayBehaviour:function(d,i,s){return F.getFormatterFunctionFromDisplayBehaviour(d)(i,s,true);},getFormattedRangeText:function(o,v,V,e){return P.getFormatedConditionText(o,v,V,e);},_initialiseCurrencyFormatter:function(){if(!F._oCurrencyFormatter){F._oCurrencyFormatter=N.getCurrencyInstance({showMeasure:false});}if(!F._MAX_CURRENCY_DIGITS){F._MAX_CURRENCY_DIGITS=3;}F._initialiseSpaceChars();},_initialiseSpaceChars:function(){if(!F._FIGURE_SPACE||!F._PUNCTUATION_SPACE){F._FIGURE_SPACE='\u2007';F._PUNCTUATION_SPACE='\u2008';}},getAmountCurrencyFormatter:function(){F._initialiseCurrencyFormatter();if(!F._fAmountCurrencyFormatter){F._fAmountCurrencyFormatter=function(a,c){var v,C,p;if(a===undefined||a===null||c==="*"){return"";}v=F._oCurrencyFormatter.format(a,c);C=F._oCurrencyFormatter.oLocaleData.getCurrencyDigits(c);if(C===0){v+=F._PUNCTUATION_SPACE;}p=F._MAX_CURRENCY_DIGITS-C;if(p){v=v.padEnd(v.length+p,F._FIGURE_SPACE);}return v;};}return F._fAmountCurrencyFormatter;},getCurrencySymbolFormatter:function(){F._initialiseCurrencyFormatter();if(!F._fCurrencySymbolFormatter){F._fCurrencySymbolFormatter=function(c){if(!c||c==="*"){return"";}return F._oCurrencyFormatter.oLocaleData.getCurrencySymbol(c);};}return F._fCurrencySymbolFormatter;},getMeasureUnitFormatter:function(){F._initialiseSpaceChars();if(!F._fMeasureFormatter){F._fMeasureFormatter=function(v,u){if(v===undefined||v===null||u==="*"){return"";}return v+F._FIGURE_SPACE;};}return F._fMeasureFormatter;},getInlineMeasureUnitFormatter:function(){F._initialiseSpaceChars();if(!F._fInlineMeasureFormatter){F._fInlineMeasureFormatter=function(v,u){if(v===undefined||v===null||u==="*"){return"";}if(!u){return v;}return v+F._FIGURE_SPACE+u;};}return F._fInlineMeasureFormatter;},getInlineAmountFormatter:function(){F._initialiseCurrencyFormatter();if(!F._fInlineAmountFormatter){F._fInlineAmountFormatter=function(a,c){var v;if(a===undefined||a===null||c==="*"){return"";}v=F._oCurrencyFormatter.format(a,c);return v+F._FIGURE_SPACE+c;};}return F._fInlineAmountFormatter;},getInlineGroupFormatterFunction:function(f,d,o){var i,r=f.type==="Edm.String"&&!f.isCalendarDate&&!f.isDigitSequence;if(f.unit){if(f.isCurrencyField){return F.getInlineAmountFormatter();}else{i=F.getInlineMeasureUnitFormatter();return function(v,u){var V=v;if(f.modelType){V=f.modelType.formatValue(v,"string");}return i(V,u);};}}else if(!d&&r&&f.description){return F.getFormatterFunctionFromDisplayBehaviour(f.displayBehaviour);}else if(f.type==="Edm.DateTime"&&f.displayFormat==="Date"&&o&&o["UTC"]){var c={displayFormat:"Date"};var s={isCalendarDate:f.isCalendarDate};var a=O.getType(f.type,o,c,s);return function(v){return a.formatValue(v,"string");};}else if(f.modelType){return function(v){return f.modelType.formatValue(v,"string");};}},getWidth:function(f,m,M){var w=f.maxLength||f.precision,W;if(!m){m=30;}if(!M){M=3;}if(f.type==="Edm.DateTime"&&f.displayFormat==="Date"||f.isCalendarDate){w="9em";}else if(w){if(f.type==="Edm.String"&&f.description&&f.displayBehaviour&&(f.displayBehaviour==="descriptionAndId"||f.displayBehaviour==="descriptionOnly")){w="Max";}if(w==="Max"){w=m+"";}W=parseInt(w);if(!isNaN(W)){W+=0.75;if(W>m){W=m;}else if(W<M){W=M;}w=W+"em";}else{w=null;}}if(!w){if(f.type==="Edm.Boolean"){w=M+"em";}else{w=m+"em";}}return w;},getEdmTimeFromDate:function(d){if(!F._oTimeFormat){F._oTimeFormat=D.getTimeInstance({pattern:"'PT'HH'H'mm'M'ss'S'"});}return F._oTimeFormat.format(d);},parseFilterNumericIntervalData:function(v){var r=[],R=v.match(RegExp("^(-?[^-]*)-(-?[^-]*)$"));if(R&&R.length>=2){r.push(R[1]);r.push(R[2]);}return r;},parseDateTimeOffsetInterval:function(v){var V=v.split('-'),r=[v],n=0;if((V.length%2)===0){r=[];for(var i=0;i<V.length/2;i++){n=v.indexOf('-',++n);}r.push(v.substr(0,n).replace(/\s+/g,''));r.push(v.substr(n+1).replace(/\s+/g,''));}return r;},_getFilterType:function(f){if(f.isDigitSequence){return"numc";}else if(O.isNumeric(f.type)){return"numeric";}else if(f.type==="Edm.DateTime"&&f.displayFormat==="Date"){return"date";}else if(f.type==="Edm.DateTimeOffset"){return"datetime";}else if(f.type==="Edm.String"){if(f.isCalendarDate){return"stringdate";}return"string";}else if(f.type==="Edm.Boolean"){return"boolean";}else if(f.type==="Edm.Time"){return"time";}return undefined;}};return F;},true);
