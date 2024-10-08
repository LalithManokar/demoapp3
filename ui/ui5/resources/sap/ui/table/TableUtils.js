/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/core/Control","sap/ui/core/ResizeHandler","sap/ui/core/library","sap/ui/core/theming/Parameters","sap/ui/model/ChangeReason","./TableGrouping","./TableColumnUtils","./TableMenuUtils","./TableBindingUtils","./library","sap/base/Log","sap/ui/thirdparty/jquery"],function(B,C,R,c,T,a,b,d,e,f,l,L,q){"use strict";var S=l.SelectionBehavior;var g=l.SelectionMode;var M=c.MessageType;var r;var h=null;var j={DATACELL:1<<1,COLUMNHEADER:1<<2,ROWHEADER:1<<3,ROWACTION:1<<4,COLUMNROWHEADER:1<<5,PSEUDO:1<<6};j.ANYCONTENTCELL=j.ROWHEADER|j.DATACELL|j.ROWACTION;j.ANYCOLUMNHEADER=j.COLUMNHEADER|j.COLUMNROWHEADER;j.ANYROWHEADER=j.ROWHEADER|j.COLUMNROWHEADER;j.ANY=j.ANYCONTENTCELL|j.ANYCOLUMNHEADER;var m={sapUiSizeCozy:48,sapUiSizeCompact:32,sapUiSizeCondensed:24,undefined:32};var k=1;var n=1;var D={sapUiSizeCozy:m.sapUiSizeCozy+n,sapUiSizeCompact:m.sapUiSizeCompact+n,sapUiSizeCondensed:m.sapUiSizeCondensed+n,undefined:m.undefined+n};var t={navigationIcon:"navigation-right-arrow",deleteIcon:"sys-cancel",resetIcon:"undo"};var o={Render:"Render",VerticalScroll:"VerticalScroll",FirstVisibleRowChange:"FirstVisibleRowChange",Unbind:"Unbind",Animation:"Animation",Resize:"Resize",Zoom:"Zoom",Unknown:"Unknown"};for(var p in a){o[p]=a[p];}var I=":sapTabbable, .sapUiTableTreeIcon:not(.sapUiTableTreeIconLeaf)";function s(E){return E!=null&&E instanceof window.HTMLInputElement&&/^(text|password|search|tel|url)$/.test(E.type);}var u={Grouping:b,Column:d,Menu:e,Binding:f,CELLTYPE:j,BaseSize:m,BaseBorderWidth:k,RowHorizontalFrameSize:n,DefaultRowHeight:D,RowsUpdateReason:o,INTERACTIVE_ELEMENT_SELECTORS:I,ThemeParameters:t,hasRowHeader:function(i){return(i.getSelectionMode()!==g.None&&i.getSelectionBehavior()!==S.RowOnly)||b.isGroupMode(i);},hasSelectAll:function(i){var v=i?i.getSelectionMode():g.None;return v===g.MultiToggle&&i.getEnableSelectAll();},hasRowHighlights:function(i){if(!i){return false;}var v=i.getRowSettingsTemplate();if(!v){return false;}var H=v.getHighlight();return v.isBound("highlight")||(H!=null&&H!==M.None);},getRowActionCount:function(i){var v=i?i.getRowActionTemplate():null;return v?v._getCount():0;},hasRowActions:function(i){var v=i?i.getRowActionTemplate():null;return v!=null&&(v.isBound("visible")||v.getVisible())&&u.getRowActionCount(i)>0;},isRowSelectionAllowed:function(i){return i.getSelectionMode()!==g.None&&(i.getSelectionBehavior()===S.Row||i.getSelectionBehavior()===S.RowOnly);},isRowSelectorSelectionAllowed:function(i){return i.getSelectionMode()!==g.None&&u.hasRowHeader(i);},areAllRowsSelected:function(i){if(!i){return false;}var v=i._getSelectionPlugin();var w=v.getSelectableCount();var x=v.getSelectedCount();return w>0&&w===x;},isNoDataVisible:function(i){if(!i.getShowNoData()){return false;}return!u.hasData(i);},hasData:function(i){var v=i.getBinding("rows");var w=i._getTotalRowCount();var H=w>0;if(v&&v.providesGrandTotal){var x=v.providesGrandTotal()&&v.hasTotaledMeasures();H=(x&&w>1)||(!x&&w>0);}return H;},isBusyIndicatorVisible:function(i){if(!i||!i.getDomRef()){return false;}return i.getDomRef().querySelector('[id="'+i.getId()+'-sapUiTableGridCnt"] > .sapUiLocalBusyIndicator')!=null;},hasPendingRequests:function(i){if(!i){return false;}if(u.canUsePendingRequestsCounter(i)){return i._iPendingRequests>0;}else{return i._bPendingRequest;}},canUsePendingRequestsCounter:function(i){var v=i?i.getBinding("rows"):null;if(u.isA(v,"sap.ui.model.analytics.AnalyticalBinding")){return v.bUseBatchRequests;}else if(u.isA(v,"sap.ui.model.TreeBinding")){return false;}return true;},isA:function(O,v){return B.isA(O,v);},toggleRowSelection:function(i,v,w,x){if(!i||!i.getBinding("rows")||i.getSelectionMode()===g.None||v==null){return false;}var y=i._getSelectionPlugin();function z(F){if(!y.isIndexSelectable(F)){return false;}i._iSourceRowIndex=F;var G=false;if(x){G=x(F,w);}else if(y.isIndexSelected(F)){if(w!==true){G=true;y.removeSelectionInterval(F,F);}}else if(w!==false){G=true;y.addSelectionInterval(F,F);}delete i._iSourceRowIndex;return G;}if(typeof v==="number"){if(v<0||v>=i._getTotalRowCount()){return false;}return z(v);}else{var $=q(v);var A=u.getCellInfo($[0]);var E=u.isRowSelectionAllowed(i);if(!u.Grouping.isInGroupingRow($[0])&&((A.isOfType(u.CELLTYPE.DATACELL|u.CELLTYPE.ROWACTION)&&E)||(A.isOfType(u.CELLTYPE.ROWHEADER)&&u.isRowSelectorSelectionAllowed(i)))){var F=i.getRows()[A.rowIndex].getIndex();return z(F);}return false;}},getNoDataText:function(i){var N=i.getNoData();if(N instanceof C){return null;}else if(typeof N==="string"||i.getNoData()instanceof String){return N;}else{return u.getResourceText("TBL_NO_DATA");}},getVisibleColumnCount:function(i){return i._getVisibleColumns().length;},getHeaderRowCount:function(v){if(v._iHeaderRowCount===undefined){if(!v.getColumnHeaderVisible()){v._iHeaderRowCount=0;}else{var H=1;var w=v.getColumns();for(var i=0;i<w.length;i++){if(w[i].shouldRender()){H=Math.max(H,w[i].getMultiLabels().length);}}v._iHeaderRowCount=H;}}return v._iHeaderRowCount;},isVariableRowHeightEnabled:function(i){var v=i._getRowCounts();return i&&i._bVariableRowHeightEnabled&&!v.fixedTop&&!v.fixedBottom;},getTotalRowCount:function(i,v){var w=i._getTotalRowCount();if(v){w=Math.max(w,i._getRowCounts().count);}return w;},getNonEmptyVisibleRowCount:function(i){return Math.min(i._getRowCounts().count,i._getTotalRowCount());},getFocusedItemInfo:function(i){var v=i._getItemNavigation();if(!v){return null;}return{cell:v.getFocusedIndex(),columnCount:v.iColumns,cellInRow:v.getFocusedIndex()%v.iColumns,row:Math.floor(v.getFocusedIndex()/v.iColumns),cellCount:v.getItemDomRefs().length,domRef:v.getFocusedDomRef()};},getRowIndexOfFocusedCell:function(i){var v=u.getFocusedItemInfo(i);return v.row-u.getHeaderRowCount(i);},isFixedColumn:function(i,v){return v<i.getComputedFixedColumnCount();},hasFixedColumns:function(i){return i.getComputedFixedColumnCount()>0;},focusItem:function(i,v,E){var w=i._getItemNavigation();if(w){w.focusItem(v,E);}},getCellInfo:function(i){var v;var $=q(i);var w;var x;var y;var z;var A;v={type:0,cell:null,rowIndex:null,columnIndex:null,columnSpan:null};if($.hasClass("sapUiTableDataCell")){w=$.attr("data-sap-ui-colid");x=sap.ui.getCore().byId(w);v.type=u.CELLTYPE.DATACELL;v.rowIndex=parseInt($.parent().attr("data-sap-ui-rowindex"));v.columnIndex=x.getIndex();v.columnSpan=1;}else if($.hasClass("sapUiTableHeaderDataCell")){y=/_([\d]+)/;w=$.attr("id");z=y.exec(w);A=z&&z[1]!=null?parseInt(z[1]):0;v.type=u.CELLTYPE.COLUMNHEADER;v.rowIndex=A;v.columnIndex=parseInt($.attr("data-sap-ui-colindex"));v.columnSpan=parseInt($.attr("colspan")||1);}else if($.hasClass("sapUiTableRowSelectionCell")){v.type=u.CELLTYPE.ROWHEADER;v.rowIndex=parseInt($.parent().attr("data-sap-ui-rowindex"));v.columnIndex=-1;v.columnSpan=1;}else if($.hasClass("sapUiTableRowActionCell")){v.type=u.CELLTYPE.ROWACTION;v.rowIndex=parseInt($.parent().attr("data-sap-ui-rowindex"));v.columnIndex=-2;v.columnSpan=1;}else if($.hasClass("sapUiTableRowSelectionHeaderCell")){v.type=u.CELLTYPE.COLUMNROWHEADER;v.columnIndex=-1;v.columnSpan=1;}else if($.hasClass("sapUiTablePseudoCell")){w=$.attr("data-sap-ui-colid");x=sap.ui.getCore().byId(w);v.type=u.CELLTYPE.PSEUDO;v.rowIndex=-1;v.columnIndex=x?x.getIndex():-1;v.columnSpan=1;}if(v.type!==0){v.cell=$;}v.isOfType=function(E){if(E==null){return false;}return(this.type&E)>0;};return v;},getRowColCell:function(i,v,w,x){var y=i.getRows()[v]||null;var z=x?i.getColumns():i._getVisibleColumns();var A=z[w]||null;var E;var F=null;if(y&&A){if(!E){var G=A.getMetadata();while(G.getName()!=="sap.ui.table.Column"){G=G.getParent();}E=G.getClass();}F=y.getCells().find(function(F){return A===E.ofCell(F);})||null;}return{row:y,column:A,cell:F};},getCell:function(i,E,v){v=v===true;if(!i||!E){return null;}var $=q(E);var w=i.getDomRef();var x=".sapUiTableCell";if(!v){x+=":not(.sapUiTablePseudoCell)";}var y=$.closest(x,w);if(y.length>0){return y;}return null;},getParentCell:function(i,E,v){v=v===true;var $=q(E);var w=u.getCell(i,E,v);if(!w||w[0]===$[0]){return null;}else{return w;}},registerResizeHandler:function(i,H,v,w,x){w=w==null?"":w;x=x===true;if(!i||typeof H!=="string"||typeof v!=="function"){return undefined;}var y=i.getDomRef(w);u.deregisterResizeHandler(i,H);if(!i._mResizeHandlerIds){i._mResizeHandlerIds={};}if(x&&y){y=y.parentNode;}if(y){i._mResizeHandlerIds[H]=R.register(y,v);}return i._mResizeHandlerIds[H];},deregisterResizeHandler:function(v,H){var w=[];if(!v._mResizeHandlerIds){return;}if(typeof H==="string"){w.push(H);}else if(H===undefined){for(var K in v._mResizeHandlerIds){if(typeof K=="string"&&v._mResizeHandlerIds.hasOwnProperty(K)){w.push(K);}}}else if(Array.isArray(H)){w=H;}for(var i=0;i<w.length;i++){var x=w[i];if(v._mResizeHandlerIds[x]){R.deregister(v._mResizeHandlerIds[x]);v._mResizeHandlerIds[x]=undefined;}}},isFirstScrollableRow:function(i,v){if(isNaN(v)){var $=q(v);v=parseInt($.add($.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"));}return v==i._getRowCounts().fixedTop;},isLastScrollableRow:function(i,v){if(isNaN(v)){var $=q(v);v=parseInt($.add($.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"));}var w=i._getRowCounts();return v==w.count-w.fixedBottom-1;},getContentDensity:function(v){var w;var x=["sapUiSizeCondensed","sapUiSizeCompact","sapUiSizeCozy"];var G=function(F,O){if(!O[F]){return;}for(var i=0;i<x.length;i++){if(O[F](x[i])){return x[i];}}};var $=v.$();if($.length>0){w=G("hasClass",$);}else{w=G("hasStyleClass",v);}if(w){return w;}var P=null;var y=v.getParent();if(y){do{w=G("hasStyleClass",y);if(w){return w;}if(y.getDomRef){P=y.getDomRef();}else if(y.getRootNode){P=y.getRootNode();}if(!P&&y.getParent){y=y.getParent();}else{y=null;}}while(y&&!P);}$=q(P||document.body);w=G("hasClass",$.closest("."+x.join(",.")));return w;},isVariableWidth:function(w){return!w||w=="auto"||w.toString().match(/%$/);},getFirstFixedBottomRowIndex:function(i){var v=i._getRowCounts();if(!i.getBinding("rows")||v.fixedBottom===0){return-1;}var F=-1;var w=i.getFirstVisibleRow();var x=i._getTotalRowCount();if(x>=v.count){F=v.count-v.fixedBottom;}else{var y=x-v.fixedBottom-w;if(y>=0&&(w+y)<x){F=y;}}return F;},getResourceBundle:function(O){O=q.extend({async:false,reload:false},O);if(r&&O.reload!==true){if(O.async===true){return Promise.resolve(r);}else{return r;}}var v=sap.ui.getCore().getLibraryResourceBundle("sap.ui.table",O.async===true);if(v instanceof Promise){v=v.then(function(i){r=i;return r;});}else{r=v;}return v;},getResourceText:function(K,v){return r?r.getText(K,v):"";},dynamicCall:function(O,v,i){var w=typeof O==="function"?O():O;if(!w||!v){return undefined;}i=i||w;if(typeof v==="function"){v.call(i,w);return undefined;}else{var P;var x=[];for(var F in v){if(typeof w[F]==="function"){P=v[F];x.push(w[F].apply(i,P));}else{x.push(undefined);}}if(x.length===1){return x[0];}else{return x;}}},throttle:function(i,O){O=Object.assign({wait:0,leading:true},O);O.maxWait=O.wait;O.trailing=true;O.requestAnimationFrame=false;return u.debounce(i,O);},debounce:function(i,O){O=Object.assign({wait:0,maxWait:null,leading:false,asyncLeading:false,trailing:true,requestAnimationFrame:false},O);var v=null;var w=null;var x=null;var y=O.maxWait!=null;O.wait=Math.max(0,O.wait);O.maxWait=y?Math.max(O.maxWait,O.wait):O.maxWait;function z(K,N,P,Q){v=Q===true?null:Date.now();if(N==null){return;}if(P===true){var U=Promise.resolve().then(function(){if(!U.canceled){i.apply(K,N);}x=null;});U.cancel=function(){U.canceled=true;};x=U;}else{i.apply(K,N);}}function A(K,N){E();function _(W){W=W!==false;if(W){G();}if(O.trailing){z(K,N,null,W);}}if(O.requestAnimationFrame){w=window.requestAnimationFrame(function(){_();});}else{var P=Date.now();var Q=v==null?0:P-v;var U=Math.max(0,y?Math.min(O.maxWait-Q,O.wait):O.wait);var V=U<O.wait;w=setTimeout(function(){if(V){var W=Math.max(0,(Date.now()-P)-U);var X=O.wait-U;if(W>X){_();}else{w=setTimeout(G,X-W);_(false);}}else{_();}},U);}}function E(){if(O.requestAnimationFrame){window.cancelAnimationFrame(w);}else{clearTimeout(w);}w=null;}function F(){if(x){x.cancel();x=null;}}function G(){E();F();v=null;}function H(){return w!=null;}var J=function(){if(!H()&&!O.leading){z();}if(H()||!O.leading){A(this,arguments);}else if(O.asyncLeading){z(this,arguments,true);A();}else{A();z(this,arguments);}};J.cancel=G;J.pending=H;return J;},getInteractiveElements:function(i){if(!i){return null;}var $=q(i);var v=u.getCellInfo($);if(v.isOfType(j.ANY|j.PSEUDO)){var w=$.find(I);if(w.length>0){return w;}}return null;},convertCSSSizeToPixel:function(i,w){var P;if(typeof i!=="string"){return null;}if(i.endsWith("px")){P=parseInt(i);}else if(i.endsWith("em")||i.endsWith("rem")){P=Math.ceil(parseFloat(i)*u.getBaseFontSize());}else{return null;}if(w){return P+"px";}else{return P;}},getBaseFontSize:function(){if(h==null){var i=document.documentElement;if(i){h=parseInt(window.getComputedStyle(i).fontSize);}}return h==null?16:h;},readThemeParameters:function(){function i(v){return u.convertCSSSizeToPixel(T.get(v));}m.undefined=i("_sap_ui_table_BaseSize");m.sapUiSizeCozy=i("_sap_ui_table_BaseSizeCozy");m.sapUiSizeCompact=i("_sap_ui_table_BaseSizeCompact");m.sapUiSizeCondensed=i("_sap_ui_table_BaseSizeCondensed");k=i("_sap_ui_table_BaseBorderWidth");n=k;D.undefined=m.undefined+n;D.sapUiSizeCozy=m.sapUiSizeCozy+n;D.sapUiSizeCompact=m.sapUiSizeCompact+n;D.sapUiSizeCondensed=m.sapUiSizeCondensed+n;t.navigationIcon=T.get("_sap_ui_table_NavigationIcon");t.deleteIcon=T.get("_sap_ui_table_DeleteIcon");t.resetIcon=T.get("_sap_ui_table_ResetIcon");},selectElementText:function(E){if(s(E)){E.select();}},deselectElementText:function(E){if(s(E)){E.setSelectionRange(0,0);}},addDelegate:function(E,i,v){if(E&&i){E.addDelegate(i,false,v?v:i,false);}},removeDelegate:function(E,i){if(E&&i){E.removeDelegate(i);}}};b.TableUtils=u;d.TableUtils=u;e.TableUtils=u;f.TableUtils=u;return u;},true);
