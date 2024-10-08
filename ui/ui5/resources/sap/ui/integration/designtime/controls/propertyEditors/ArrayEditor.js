/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/controls/propertyEditors/BasePropertyEditor","sap/base/util/deepClone","sap/m/VBox","sap/m/Bar","sap/m/Label","sap/m/Button"],function(B,d,V,a,L,b){"use strict";var A=B.extend("sap.ui.integration.designtime.controls.propertyEditors.ArrayEditor",{constructor:function(){B.prototype.constructor.apply(this,arguments);var c=new V();this.addContent(c);c.bindAggregation("items","items",function(i,I){var o=I.getObject();var e=this.getConfig().items.indexOf(o);var g=new V({items:new a({contentLeft:[new L({text:this.getConfig().itemLabel||"{i18n>CARD_EDITOR.ARRAY.ITEM_LABEL}"})],contentRight:[new b({icon:"sap-icon://less",tooltip:"{i18n>CARD_EDITOR.ARRAY.REMOVE}",press:function(e){var v=this.getConfig().value;v.splice(e,1);this.firePropertyChanged(v);}.bind(this,e)})]})});Object.keys(o).forEach(function(s){var f=o[s];var S=this.getEditor().createPropertyEditor(f);S.getLabel().setDesign("Standard");g.addItem(S);}.bind(this));return g;}.bind(this));this.addContent(new a({contentRight:[new b({icon:"sap-icon://add",tooltip:"{i18n>CARD_EDITOR.ARRAY.ADD}",enabled:"{= ${items} ? ${items}.length < ${maxItems} : false}",press:function(){var v=this.getConfig().value;v.push({});this.firePropertyChanged(v);}.bind(this)})]}));},onValueChange:function(){var r=B.prototype.onValueChange.apply(this,arguments);var c=this.getConfig();if(c.value&&c.template){c.items=[];c.value.forEach(function(v,i){var I=d(c.template);Object.keys(I).forEach(function(k){var o=I[k];if(o.path){o.path=o.path.replace(":index",i);}});c.items.push(I);});this.getModel().checkUpdate();}return r;},renderer:B.getMetadata().getRenderer().render});return A;});
