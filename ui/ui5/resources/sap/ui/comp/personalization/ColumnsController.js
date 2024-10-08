/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['./BaseController','sap/m/library','sap/ui/comp/library','./Util','sap/base/util/merge'],function(B,M,C,U,m){"use strict";var c=B.extend("sap.ui.comp.personalization.ColumnsController",{constructor:function(i,s){B.apply(this,arguments);this.setType(M.P13nPanelType.columns);this.setItemType(M.P13nPanelType.columns+"Items");},metadata:{properties:{triggerModelChangeOnColumnInvisible:{type:"boolean",group:"Misc",defaultValue:false}},events:{afterColumnsModelDataChange:{}}}});c.prototype.setTable=function(t){B.prototype.setTable.apply(this,arguments);if(this.getTableType()===C.personalization.TableType.AnalyticalTable||this.getTableType()===C.personalization.TableType.Table||this.getTableType()===C.personalization.TableType.TreeTable){t.detachColumnMove(this._onColumnMove,this);t.detachColumnVisibility(this._onColumnVisibility,this);t.detachColumnResize(this._onColumnResize,this);t.attachColumnMove(this._onColumnMove,this);t.attachColumnVisibility(this._onColumnVisibility,this);t.attachColumnResize(this._onColumnResize,this);}this._monkeyPatchTable(t);};c.prototype.getColumn2Json=function(o,s,i){return{columnKey:s,index:i,visible:o.getVisible(),width:o.getWidth?o.getWidth():undefined,total:o.getSummed?o.getSummed():undefined};};c.prototype.getAdditionalData2Json=function(j,t){j.columns.fixedColumnCount=t&&t.getFixedColumnCount?t.getFixedColumnCount():undefined;};c.prototype.getColumn2JsonTransient=function(o,s,t,T){return{columnKey:s,text:t,tooltip:T};};c.prototype.handleIgnore=function(j,i){j.columns.columnsItems[i].visible=false;};c.prototype.syncJson2Table=function(j){var t=this.getTable();var o=this.getColumnMap();this.fireBeforePotentialTableChange();if(this.getTable()&&(this.getTableType()===C.personalization.TableType.AnalyticalTable||this.getTableType()===C.personalization.TableType.Table||this.getTableType()===C.personalization.TableType.TreeTable)){this._applyChangesToUiTableType(t,j,o);}else if(this.getTableType()===C.personalization.TableType.ResponsiveTable){this._applyChangesToMTableType(t,j,o);}this.fireAfterPotentialTableChange();};c.prototype.getDataSuiteFormat2Json=function(d){var j=this.createControlDataStructure();var a=function(s,p,P){var i=U.getIndexByKey("columnKey",s,j.columns.columnsItems);if(i<0){i=j.columns.columnsItems.length;j.columns.columnsItems.splice(i,0,{columnKey:s});}j.columns.columnsItems[i][p]=P;};this.getControlDataInitial().columns.columnsItems.filter(function(o){return o.visible===true;}).forEach(function(o){a(o.columnKey,"visible",false);});if(d.Visualizations&&d.Visualizations.length){var l=d.Visualizations.filter(function(v){return v.Type==="LineItem";});if(l.length){l[0].Content.forEach(function(o,i){a(o.Value,"visible",true);a(o.Value,"index",i);},this);}}if(d.Total&&d.Total.length){d.Total.forEach(function(s){a(s,"total",true);});}return j;};c.prototype.getDataSuiteFormatSnapshot=function(d){var o=this.getUnionData(this.getControlDataInitial(),this.getControlData());if(!o.columns||!o.columns.columnsItems||!o.columns.columnsItems.length){return;}var a=o.columns.columnsItems.filter(function(e){return!!e.total;});if(a.length){d.Total=a.map(function(e){return e.columnKey;});}var b=o.columns.columnsItems.filter(function(e){return!!e.visible;});if(b.length){if(!d.Visualizations){d.Visualizations=[];}b.sort(this._sortByIndex);d.Visualizations.push({Type:"LineItem",Content:b.map(function(e){return{Value:e.columnKey,Label:undefined};})});}};c.prototype._onColumnMove=function(e){var i=e.getParameter("newPos");var s=U.getColumnKey(e.getParameter("column"));var o=this.getControlData();var I=U.getIndexByKey("columnKey",s,o.columns.columnsItems);if(I<0||i<0||I>o.columns.columnsItems.length-1||i>o.columns.columnsItems.length-1){return;}this.fireBeforePotentialTableChange();var a=o.columns.columnsItems.splice(I,1);o.columns.columnsItems.splice(i,0,a[0]);var b=-1;o.columns.columnsItems.forEach(function(d){if(d.index!==undefined){d.index=++b;}});this.updateControlDataBaseFromJson(o);this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange();};c.prototype._onColumnVisibility=function(e){this.fireBeforePotentialTableChange();this._updateInternalModel(U.getColumnKey(e.getParameter("column")),"visible",e.getParameter("newVisible"));this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange();};c.prototype._onColumnTotal=function(p){this.fireBeforePotentialTableChange();this._updateInternalModel(U.getColumnKey(p.column),"total",p.isSummed);this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange();};c.prototype._onColumnResize=function(e){this.fireBeforePotentialTableChange();this._updateInternalModel(U.getColumnKey(e.getParameter("column")),"width",e.getParameter("width"));this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange();};c.prototype._onColumnFixedCount=function(f){this.fireBeforePotentialTableChange();var o=this.getControlData();this.getInternalModel().setProperty("/controlData/columns/fixedColumnCount",f);this.updateControlDataBaseFromJson(o);this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange();};c.prototype._updateInternalModel=function(s,p,P){if(!s||!p){return;}var o=this.getControlData();var i=U.getIndexByKey("columnKey",s,o.columns.columnsItems);if(i<0){throw"No entry found in 'controlDataBase' for columnKey '"+s+"'";}this.getInternalModel().setProperty("/controlData/columns/columnsItems/"+i+"/"+p,P);this.updateControlDataBaseFromJson(o);};c.prototype.getPanel=function(p){var v=(p&&p.visibleItemsThreshold)?p.visibleItemsThreshold:-1;return new Promise(function(r){sap.ui.require(['sap/m/P13nColumnsPanel','sap/m/P13nItem','sap/m/P13nColumnsItem'],function(P,a,b){return r(new P({visibleItemsThreshold:v,items:{path:'$sapmP13nPanel>/transientData/columns/columnsItems',template:new a({columnKey:'{$sapmP13nPanel>columnKey}',text:'{$sapmP13nPanel>text}',tooltip:'{$sapmP13nPanel>tooltip}'})},columnsItems:{path:"$sapmP13nPanel>/controlDataReduce/columns/columnsItems",template:new b({columnKey:"{$sapmP13nPanel>columnKey}",index:"{$sapmP13nPanel>index}",visible:"{$sapmP13nPanel>visible}",width:"{$sapmP13nPanel>width}",total:"{$sapmP13nPanel>total}"})},beforeNavigationTo:this.setModelFunction(),changeColumnsItems:function(e){if(!e.getParameter("items")){return;}var o=this.getControlDataReduce();o.columns.columnsItems=e.getParameter("items");this.setControlDataReduce2Model(o);this.fireAfterPotentialModelChange({json:o});}.bind(this)}));}.bind(this));}.bind(this));};c.prototype._sortByIndex=function(a,b){if(a.index!==undefined&&b.index===undefined){return-1;}if(b.index!==undefined&&a.index===undefined){return 1;}if(a.index<b.index){return-1;}if(a.index>b.index){return 1;}return 0;};c.prototype._applyChangesToUiTableType=function(t,j,o){var a=null;var b={};var d=this;var s=function(i,k){i.forEach(function(n){b[n.columnKey]=n;});i.sort(d._sortByIndex);var l=i.map(function(n){return n.columnKey;});k.forEach(function(n,I){if(l.indexOf(n)<0){l.splice(I,0,n);}});return l;};var S=function(i,a){var k=b[i];if(k&&k.visible!==undefined&&a.getVisible()!==k.visible){a.setVisible(k.visible,true);}};var f=function(i,k,a){var T=t.indexOfColumn(a);var l=i;if(l!==undefined&&T!==l){if(T>-1){t.removeColumn(a,true);}t.insertColumn(a,l,true);}};var e=function(i,a){var k=b[i];if(k&&k.width!==undefined&&a.getWidth()!==k.width){a.setWidth(k.width,true);}};var g=function(i,a){var k=b[i];if(k&&k.total!==undefined&&a.getSummed&&a.getSummed()!==k.total){a.setSummed(k.total,true);}};if(j.columns.columnsItems.length){var h=s(j.columns.columnsItems,this.getColumnKeys());h.forEach(function(i,I){a=o[i];if(a){S(i,a);f(I,i,a);e(i,a);g(i,a);}});}var F=j.columns.fixedColumnCount||0;if(t.getFixedColumnCount&&t.getFixedColumnCount()!==F){t.setFixedColumnCount(F,true);}};c.prototype._applyChangesToMTableType=function(t,j,o){var T=false;var s=function(a,b){var i=a.index;if(i!==undefined){b.setOrder(i,true);T=true;}};var S=function(a,b){if(a.visible!==undefined&&b.getVisible()!==a.visible){b.setVisible(a.visible,true);T=true;}};if(j.columns.columnsItems.length){j.columns.columnsItems.sort(function(a,b){if(a.index<b.index){return-1;}if(a.index>b.index){return 1;}return 0;});j.columns.columnsItems.forEach(function(a){var b=o[a.columnKey];if(b){s(a,b);S(a,b);}},this);}if(T){t.invalidate();}};c.prototype.getChangeType=function(o,a){var b=this.getChangeData(o,a);var n=this.getTableType()===C.personalization.TableType.AnalyticalTable||this.getTriggerModelChangeOnColumnInvisible();if(b){var d=C.personalization.ChangeType.TableChanged;b.columns.columnsItems.some(function(i){if(i.visible||(i.visible===false&&n)){d=C.personalization.ChangeType.ModelChanged;return true;}if(i.total===false||i.total===true){d=C.personalization.ChangeType.ModelChanged;return true;}});return d;}return C.personalization.ChangeType.Unchanged;};c.prototype.getChangeData=function(o,a){if(!a||!a.columns||!a.columns.columnsItems){return null;}var b={columns:U.copy(o.columns)};var i=true;i=(o.columns.fixedColumnCount===a.columns.fixedColumnCount);o.columns.columnsItems.some(function(I){var d=U.getArrayElementByKey("columnKey",I.columnKey,a.columns.columnsItems);if(!U.semanticEqual(I,d)){i=false;return true;}});if(i){return null;}var t=[];b.columns.columnsItems.forEach(function(I,d){var e=U.getArrayElementByKey("columnKey",I.columnKey,a.columns.columnsItems);if(U.semanticEqual(I,e)){t.push(I);return;}for(var p in I){if(p==="columnKey"||!e){if(e&&e[p]===undefined){delete I[p];}else{continue;}}if(I[p]===e[p]){delete I[p];}}if(Object.keys(I).length<2){t.push(I);}});t.forEach(function(I){var d=U.getIndexByKey("columnKey",I.columnKey,b.columns.columnsItems);b.columns.columnsItems.splice(d,1);});if(b.columns.fixedColumnCount===0){delete b.columns.fixedColumnCount;}return b;};c.prototype._sortArrayByPropertyName=function(A,p,t){var s=[];if(t===null||t===undefined){t=false;}if(A&&A.length>0&&p!==undefined&&p!==null&&p!==""){if(t){s=m([],A);}else{s=A;}s.sort(function(a,b){var d=a[p];var e=b[p];if(d<e||(d!==undefined&&e===undefined)){return-1;}if(d>e||(d===undefined&&e!==undefined)){return 1;}return 0;});}return s;};c.prototype.getUnionData=function(j,J){if(!J||!J.columns||!J.columns.columnsItems){return U.copy(j);}var u=U.copy(J);Object.keys(j.columns).forEach(function(a){if(Array.isArray(j.columns[a])){j.columns[a].forEach(function(o){var b=U.getArrayElementByKey("columnKey",o.columnKey,u.columns[a]);if(!b){u.columns[a].push(o);return;}if(b.visible===undefined&&o.visible!==undefined){b.visible=o.visible;}if(b.width===undefined&&o.width!==undefined){b.width=o.width;}if(b.total===undefined&&o.total!==undefined){b.total=o.total;}if(b.index===undefined&&o.index!==undefined){b.index=o.index;}});return;}if(u.columns[a]===undefined&&j.columns[a]!==undefined){u.columns[a]=j.columns[a];}},this);return u;};c.prototype.fixConflictWithIgnore=function(j,J){if(!j||!j.columns||!j.columns.columnsItems||!J||!J.columns||!J.columns.columnsItems||!J.columns.columnsItems.length){return j;}this._sortArrayByPropertyName(j.columns.columnsItems,"index");var i=false;J.columns.columnsItems.forEach(function(o){var a=U.getIndexByKey("columnKey",o.columnKey,j.columns.columnsItems);if(a<0||j.columns.columnsItems[a].index===undefined){return;}if((a+1<=j.columns.columnsItems.length-1&&j.columns.columnsItems[a+1].index===j.columns.columnsItems[a].index)||(a-1>=0&&j.columns.columnsItems[a-1].index===j.columns.columnsItems[a].index)){i=true;}if(a+1<=j.columns.columnsItems.length-1&&j.columns.columnsItems[a+1].index===j.columns.columnsItems[a].index){var b=j.columns.columnsItems.splice(a,1);j.columns.columnsItems.splice(a+1,0,b[0]);}});if(i){var I=-1;j.columns.columnsItems.forEach(function(o){if(o.index!==undefined){o.index=++I;}});}};c.prototype.isColumnSelected=function(o,s){var i=U.getIndexByKey("columnKey",s,o.columnsItems);return(i>-1)?o.columnsItems[i].visible:false;};c.prototype._monkeyPatchTable=function(t){if(this.getTableType()!==C.personalization.TableType.AnalyticalTable&&this.getTableType()!==C.personalization.TableType.Table&&this.getTableType()!==C.personalization.TableType.TreeTable){return;}var a=this;var s=t.setFixedColumnCount.bind(t);var S=function(f,b){a._onColumnFixedCount(f);s(f,b);};if(t.setFixedColumnCount.toString()===S.toString()){return;}t.setFixedColumnCount=S;};c.prototype.exit=function(){B.prototype.exit.apply(this,arguments);var t=this.getTable();if(this.getTable()&&(this.getTableType()===C.personalization.TableType.AnalyticalTable||this.getTableType()===C.personalization.TableType.Table||this.getTableType()===C.personalization.TableType.TreeTable)){t.detachColumnMove(this._onColumnMove,this);t.detachColumnVisibility(this._onColumnVisibility,this);t.detachColumnResize(this._onColumnResize,this);}};return c;},true);
