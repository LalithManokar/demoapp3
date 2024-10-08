/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/base/util/ObjectPath"],function(O){"use strict";var A={getAppLifeCycleService:function(){var c=A.getContainer();return c.getService("AppLifeCycle");},getContainer:function(){var c=O.get("sap.ushell.Container");if(!c){throw new Error("Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");}return c;},getCurrentRunningApplication:function(){var a=A.getAppLifeCycleService();return a.getCurrentApplication();}};return A;});
