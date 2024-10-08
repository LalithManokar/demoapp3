/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/library','sap/m/library','sap/ui/model/json/JSONModel','sap/m/Dialog','sap/m/Text','sap/m/Label','sap/m/Input','sap/m/CheckBox','sap/m/Button','sap/m/Select','sap/m/VBox','sap/ui/core/Item','sap/base/util/uid','sap/ui/core/syncStyleClass','sap/base/Log','sap/ui/util/openWindow'],function(c,l,J,D,T,L,I,C,B,S,V,a,u,s,b,o){'use strict';var d=l.ButtonType;var e=c.ValueState;var r=sap.ui.getCore().getLibraryResourceBundle('sap.ui.export',true);function g(f,R){var h={fileName:'Standard',fileType:[{key:'xlsx'}],selectedFileType:'xlsx',splitCells:false,includeFilterSettings:false,addDateTime:false};var E=Object.assign({},h,f||{});for(var i=0;i<E.fileType.length;i++){var j;if(!E.fileType[i].text){E.fileType[i].text=R.getText(E.fileType[i].key.toUpperCase()+'_FILETYPE');}if(E.fileType[i].key===E.selectedFileType){j=E.fileType[i].key;}}if(!j){E.selectedFileType=E.fileType[0].key;}return E;}var U={_INTERCEPTSERVICE:'sap/ushell/cloudServices/interceptor/InterceptService',interceptUrl:function(f){var h=sap.ui.require(U._INTERCEPTSERVICE);if(h){var i=h.getInstance();if(i&&i.interceptUrl){f=i.interceptUrl(f);}}return f;},openExportSettingsDialog:function(f,O){return new Promise(function(R,h){var i;var j=new Promise(function(k,m){i=k;});var H={getUserInput:function(){return j;},cancel:function(){if(H._oExportSettingsDialog){H._oExportSettingsDialog.close();}}};r.then(function(k){var E=new J();E.setData(g(f,k));var m=u();H._oExportSettingsDialog=new D({id:m,title:k.getText('EXPORT_SETTINGS_TITLE'),horizontalScrolling:false,verticalScrolling:false,content:[new V({renderType:'Bare',width:'100%',items:[new L({text:k.getText('FILE_NAME'),labelFor:m+'-fileName'}),new I({id:m+'-fileName',value:'{/fileName}',liveChange:function(n){var p=n.getSource();var F=n.getParameter('value');var q=/[\\/:|?"*<>]/;var t=sap.ui.getCore().byId(m+'-export');var v=q.test(F);if(v){p.setValueState(e.Error);p.setValueStateText(k.getText('FILENAME_ERROR'));}else if(F.length>100){p.setValueState(e.Warning);p.setValueStateText(k.getText('FILENAME_WARNING'));}else{p.setValueState(e.None);p.setValueStateText(null);}t.setEnabled(!v);}}).addStyleClass('sapUiTinyMarginBottom'),new L({text:k.getText('SELECT_FORMAT'),labelFor:m+'-fileType',visible:false}),new S({id:m+'-fileType',width:'100%',selectedKey:'{/selectedFileType}',visible:false,items:{path:'/fileType',template:new a({key:'{key}',text:'{text}'})}}),new C({id:m+'-splitCells',selected:'{/splitCells}',text:k.getText('SPLIT_CELLS')}),new C({id:m+'-includeFilterSettings',selected:'{/includeFilterSettings}',text:k.getText('INCLUDE_FILTER_SETTINGS')}),new C({id:m+'-addDateTime',selected:'{/addDateTime}',text:k.getText('ADD_DATE_TIME'),visible:false})]}).addStyleClass('sapUiExportSettingsLabel')],endButton:new B({id:m+'-cancel',text:k.getText('CANCEL_BUTTON'),press:function(){H.cancel();}}),beginButton:new B({id:m+'-export',text:k.getText('EXPORT_BUTTON'),type:d.Emphasized,press:function(){if(H._oExportSettingsDialog){H._oExportSettingsDialog._bSuccess=true;i(E.getData());H._oExportSettingsDialog.close();}}}),afterClose:function(){if(!H._oExportSettingsDialog._bSuccess){i(null);}H._oExportSettingsDialog.destroy();H._oExportSettingsDialog=null;}});H._oExportSettingsDialog.addStyleClass('sapUiContentPadding sapUiExportSettings');H._oExportSettingsDialog.setModel(E);if(O){s('sapUiSizeCompact',O,H._oExportSettingsDialog);}H._oExportSettingsDialog.open();R(H);});});},_getReadableFilterValue:function(f){switch(f.op||f.name){case'==':return'='+f.right.value;case'>':case'<':case'!=':case'<=':case'>=':return f.op+f.right.value;case'between':return f.args[1].value+'...'+f.args[2].value;case'contains':return'*'+f.args[1].value+'*';case'endswith':return'*'+f.args[1].value;case'startswith':return f.args[1].value+'*';default:throw Error('getReadableFilter');}},_parseFilter:function(f){switch(f.type){case'Logical':return U._parseLogical(f);case'Binary':return U._parseBinary(f);case'Unary':return U._parseUnary(f);case'Call':return U._parseCall(f);default:throw Error('Filter type '+f.type+' not supported');}},_parseLogical:function(f){if(f.op=='&&'&&f.left.type==='Binary'&&f.right.type==='Binary'&&f.left.op==='>='&&f.right.op==='<='&&f.left.left.path===f.right.left.path){return U._parseCall({args:[{path:f.left.left.path,type:'Reference'},{type:'Literal',value:f.left.right.value},{type:'Literal',value:f.right.right.value}],name:'between',type:'Call'});}return U._parseFilter(f.left).concat(U._parseFilter(f.right));},_parseBinary:function(f){if(!f.left||f.left.type!='Reference'||!f.right||f.right.type!='Literal'){return[];}return[{key:f.left.path,value:U._getReadableFilterValue(f)}];},_parseUnary:function(f){var h;if(!f.arg){return[];}h=U._parseFilter(f.arg);h[0].value='!'+h[0].value;return h;},_parseCall:function(f){if(!f.args||f.args.length<2){return[];}return[{key:f.args[0].path,value:U._getReadableFilterValue(f)}];},parseFilterConfiguration:function(f,h){return new Promise(function(R,i){r.then(function(j){var F,k;F={name:j.getText('FILTER_HEADER'),items:[]};if(!f||!(f.isA('sap.ui.model.ListBinding')||f.isA('sap.ui.model.TreeBinding'))){b.error('A ListBinding is required for parsing the filter settings');i();return null;}var m=f.getFilterInfo();if(m){F.items=U._parseFilter(m);}if(typeof h==='function'){F.items.forEach(function(n){k=h(n.key);n.key=k&&typeof k==='string'?k:n.key;});}R(F);});});},getAvailableCloudExportTargets:function(){var f=U.getCloudExportService();return f.then(function(h){return h&&h.getSupportedTargets?h.getSupportedTargets():[];}).catch(function(){return[];});},getCloudExportService:function(){return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getServiceAsync?sap.ushell.Container.getServiceAsync('ProductivityIntegration'):Promise.reject();},saveAsFile:function(f,F){var h,i,j;if(!(f instanceof Blob)){return;}h=document.createElementNS('http://www.w3.org/1999/xhtml','a');i='download'in h;if(i){j=function(k,m){h.download=m;h.href=URL.createObjectURL(k);h.dispatchEvent(new MouseEvent('click'));};}if(typeof j==='undefined'){j=function(k){var m=new FileReader();m.onloadend=function(){var n,p;p=m.result.replace(/^data:[^;]*;/,'data:attachment/file;');n=o(p,'_blank');if(!n){window.location.href=p;}};m.readAsDataURL(k);};}if(typeof navigator!=='undefined'&&navigator.msSaveOrOpenBlob){j=function(k,m){window.navigator.msSaveOrOpenBlob(k,m);};}j(f,F);}};return U;},true);
