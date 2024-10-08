/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/layout/GridData"],function(G){"use strict";var Q={};Q.render=function(r,q){var p=q.getPageContent();r.write("<div");r.addClass("sapMQuickViewPage sapInoMySettingPage");r.writeControlData(q);r.writeClasses();r.write(">");if(p.header){r.renderControl(p.header);}if(p.dimensionForm){var c=p.dimensionForm.getContent();for(var i=0;i<c.length;i++){c[i].setLayoutData(new G({span:"XL5 L5 M12 S12"}));}r.renderControl(p.dimensionForm);}r.renderControl(p.form);r.write("</div>");};return Q;},true);
