// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/UserInfo","sap/ushell/appRuntime/ui5/AppRuntimeService","sap/ui/thirdparty/jquery","sap/base/Log","sap/base/util/ObjectPath"],function(U,A,q,L,O){"use strict";function a(o,c){U.call(this,o,c);this.getThemeList=function(){return A.sendMessageToOuterShell("sap.ushell.services.UserInfo.getThemeList");};this.updateUserPreferences=function(){return A.sendMessageToOuterShell("sap.ushell.services.UserInfo.updateUserPreferences",{language:sap.ushell.Container.getUser().getLanguage()});};this.getLanguageList=function(){return A.sendMessageToOuterShell("sap.ushell.services.UserInfo.getLanguageList");};this.getShellUserInfo=function(){return A.sendMessageToOuterShell("sap.ushell.services.UserInfo.getShellUserInfo");};}O.set("sap.ushell.services.UserInfo",a);a.prototype=U.prototype;a.hasNoAdapter=U.hasNoAdapter;return a;},true);
