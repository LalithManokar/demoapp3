// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/ContentExtensionAdapterFactory","sap/ui/thirdparty/jquery","sap/ushell/resources","sap/ushell/services/_AppState/AppStatePersistencyMethod"],function(C,q,r,A){"use strict";function L(a){var t=this,T=[],o=C.getAdapters();this.oAdapters={"default":a};o.then(function(b){q.extend(this.oAdapters,b);}.bind(this));this.getGroups=function(){var d=new q.Deferred();o.then(function(){var G=Object.keys(t.oAdapters).map(function(s){return t._getAdapter(s).getGroups();});q.when.apply(q,G).done(function(){var b=[].concat.apply([],arguments);d.resolve(b);}).fail(function(){q.sap.log.error("getGroups failed");});});return d.promise();};this.getGroupsForBookmarks=function(G){var d=q.Deferred();this.getGroups().then(function(b){this.getDefaultGroup().then(function(D){if(b.length>0){b=b.filter(function(c){if(G!==undefined&&G===true){return this.isGroupVisible(c);}return(!this.isGroupLocked(c)&&this.isGroupVisible(c));}.bind(this));b=b.map(function(c){return{title:(c===D&&r.i18n.getText("my_group"))||this.getGroupTitle(c),object:c};}.bind(this));}d.resolve(b);}.bind(this),function(e){q.sap.log.error("getGroupsForBookmarks - getDefaultGroup - failed: "+e.message);});}.bind(this),function(e){q.sap.log.error("getGroupsForBookmarks - getGroups - failed: "+e.message);});return d.promise();};this.getDefaultGroup=function(){var p=this._getAdapter().getDefaultGroup();p.fail(function(){q.sap.log.error("getDefaultGroup failed");});return p;};this.getGroupTitle=function(G){return this._getAdapter(G.contentProvider).getGroupTitle(G);};this.getGroupId=function(G){return this._getAdapter(G.contentProvider).getGroupId(G);};this.getGroupById=function(G){var D=q.Deferred(),t=this;this.getGroups().then(function(b){b=q.grep(b,function(e){return t.getGroupId(e)===G;});D.resolve((b&&b.length>0?b[0]:undefined));});return D.promise();};this.getGroupTiles=function(G){return this._getAdapter(G.contentProvider).getGroupTiles(G);};this.getTilesByGroupId=function(G){var D=q.Deferred(),t=this;this.getGroupById(G).then(function(b){if(b){var c=t._getAdapter(b.contentProvider).getGroupTiles(b);if(c){c=c.map(function(d){return{id:t.getTileId(d),title:t.getTileTitle(d),subtitle:t.getCatalogTilePreviewSubtitle(d),url:t.getCatalogTileTargetURL(d),icon:t.getCatalogTilePreviewIcon(d),groupId:G};});}else{c=[];}D.resolve(c);}else{D.resolve([]);}});return D.promise();};this.getLinkTiles=function(G){return this._getAdapter(G.contentProvider).getLinkTiles(G);};this.addGroupAt=function(s,i){var p,b=i,a=this._getAdapter();if(a.addGroupAt){p=a.addGroupAt(s,i);p.fail(function(){q.sap.log.error("addGroup "+s+" failed");});}else{var d=new q.Deferred();p=a.addGroup(s);p.done(function(n){var m=this.moveGroup(n,b),c=n;m.done(function(){d.resolve(c);});m.fail(function(){d.reject();});}.bind(this));p.fail(function(){q.sap.log.error("addGroup "+s+" failed");d.reject();});return d.promise();}return p;};this.addGroup=function(s){var p=this._getAdapter().addGroup(s);p.fail(function(){q.sap.log.error("addGroup "+s+" failed");});return p;};this.removeGroup=function(G,i){var p=this._getAdapter(G.contentProvider).removeGroup(G,i);p.fail(function(){q.sap.log.error("Fail to removeGroup "+t.getGroupTitle(G));});return p;};this.resetGroup=function(G,i){var p=this._getAdapter(G.contentProvider).resetGroup(G,i);p.fail(function(){q.sap.log.error("Fail to resetGroup "+t.getGroupTitle(G));});return p;};this.isGroupRemovable=function(G){return this._getAdapter(G.contentProvider).isGroupRemovable(G);};this.isGroupLocked=function(G){var a=this._getAdapter(G.contentProvider);if(typeof a.isGroupLocked==="function"){return a.isGroupLocked(G);}return false;};this.isGroupFeatured=function(G){var a=this._getAdapter(G.contentProvider);if(typeof a.isGroupFeatured==="function"){return a.isGroupFeatured(G);}return false;};this.moveGroup=function(G,n){var p=this._getAdapter(G.contentProvider).moveGroup(G,n);p.fail(function(){q.sap.log.error("Fail to moveGroup "+t.getGroupTitle(G));});return p;};this.setGroupTitle=function(G,s){var p=this._getAdapter(G.contentProvider).setGroupTitle(G,s);p.fail(function(){q.sap.log.error("Fail to set Group title: "+t.getGroupTitle(G));});return p;};this.hideGroups=function(h){var d=new q.Deferred(),a=this._getAdapter();if(typeof a.hideGroups!=="function"){d.reject("hideGroups() is not implemented in the Adapter.");}else{a.hideGroups(h).done(function(){d.resolve();}).fail(function(m){q.sap.log.error("Fail to store groups visibility."+m);d.reject();});}return d.promise();};this.isGroupVisible=function(G){var a=this._getAdapter(G.contentProvider);if(typeof a.isGroupVisible==="function"){return a.isGroupVisible(G);}return true;};this.addTile=function(c,G){var p=this._getAdapter(G.contentProvider).addTile(c,G),t=this;p.done(function(){t.changeURLStatesToPersistent(t.getCatalogTileTargetURL(c));});p.fail(function(){q.sap.log.error("Fail to add Tile: "+t.getCatalogTileId(c));});return p;};this.removeTile=function(G,b,i){var p=this._getAdapter(G.contentProvider).removeTile(G,b,i),t=this;p.done(function(){t.deleteURLStatesPersistentData(t.getCatalogTileTargetURL(b));});p.fail(function(){q.sap.log.error("Fail to remove Tile: "+t.getTileId(b));});return p;};this.moveTile=function(b,s,i,S,c,n){var p=this._getAdapter().moveTile(b,s,i,S,c,n);p.fail(function(){q.sap.log.error("Fail to move Tile: "+t.getTileId(b));});return p;};this.isLinkPersonalizationSupported=function(b){var s=b&&b.contentProvider,a=this._getAdapter(s);if(typeof a.isLinkPersonalizationSupported==="function"){return a.isLinkPersonalizationSupported(b);}return false;};this.getTileId=function(b){var s=b&&b.contentProvider;return this._getAdapter(s).getTileId(b);};this.getTileTitle=function(b){var s=b&&b.contentProvider;return this._getAdapter(s).getTileTitle(b);};this.getTileType=function(b){var s=b&&b.contentProvider,a=this._getAdapter(s);if(a.getTileType){return a.getTileType(b);}return"tile";};this.getTileView=function(b){var s=b&&b.contentProvider,d=this._getAdapter(s).getTileView(b);if(!q.isFunction(d.promise)){d=new q.Deferred().resolve(d).promise();}return d;};this.getCardManifest=function(G){var s=G&&G.contentProvider;return this._getAdapter(s).getCardManifest(G);};this.getAppBoxPressHandler=function(b){var s=b&&b.contentProvider,a=this._getAdapter(s);if(a.getAppBoxPressHandler){return a.getAppBoxPressHandler(b);}return undefined;};this.getTileSize=function(b){var s=b&&b.contentProvider;return this._getAdapter(s).getTileSize(b);};this.getTileTarget=function(b){var s=b&&b.contentProvider;return this._getAdapter(s).getTileTarget(b);};this.getTileDebugInfo=function(b){var s=b&&b.contentProvider,a=this._getAdapter(s);if(typeof a.getTileDebugInfo==="function"){return a.getTileDebugInfo(b);}return undefined;};this.isTileIntentSupported=function(b){var s=b&&b.contentProvider,a=this._getAdapter(s);if(typeof a.isTileIntentSupported==="function"){return a.isTileIntentSupported(b);}return true;};this.refreshTile=function(b){var s=b&&b.contentProvider;this._getAdapter(s).refreshTile(b);};this.setTileVisible=function(b,n){var s=b&&b.contentProvider;return this._getAdapter(s).setTileVisible(b,n);};this.registerTileActionsProvider=function(p){if(typeof p!=="function"){throw new Error("Tile actions Provider is not a function");}T.push(p);};this.getTileActions=function(b){var c=[],d,s=b&&b.contentProvider,a=this._getAdapter(s);if(typeof a.getTileActions==="function"){d=a.getTileActions(b);if(d&&d.length&&d.length>0){c.push.apply(c,d);}}for(var i=0;i<T.length;i++){d=T[i](b);if(d&&d.length&&d.length>0){c.push.apply(c,d);}}return c;};this.getCatalogs=function(){return this._getAdapter().getCatalogs();};this.isCatalogsValid=function(){return this._getAdapter().isCatalogsValid();};this.getCatalogData=function(c){var l=this._getAdapter();if(typeof l.getCatalogData!=="function"){q.sap.log.warning("getCatalogData not implemented in adapter",null,"sap.ushell.services.LaunchPage");return{id:this.getCatalogId(c)};}return l.getCatalogData(c);};this.getCatalogError=function(c){return this._getAdapter().getCatalogError(c);};this.getCatalogId=function(c){return this._getAdapter().getCatalogId(c);};this.getCatalogTitle=function(c){return this._getAdapter().getCatalogTitle(c);};this.getCatalogTiles=function(c){var p=this._getAdapter().getCatalogTiles(c);p.fail(function(){q.sap.log.error("Fail to get Tiles of Catalog: "+t.getCatalogTitle(c));});return p;};this.getCatalogTileId=function(b){return this._getAdapter(b.contentProvider).getCatalogTileId(b);};this.getCatalogTileTitle=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTileTitle(c);};this.getCatalogTileSize=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTileSize(c);};this.getCatalogTileViewControl=function(c){var s=c&&c.contentProvider;var l=this._getAdapter(s);if(typeof l.getCatalogTileViewControl==="function"){return l.getCatalogTileViewControl(c);}var d=new q.Deferred(),R=this.getCatalogTileView(c);d.resolve(R);return d.promise();};this.getCatalogTileView=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTileView(c);};this.getCatalogTileTargetURL=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTileTargetURL(c);};this.getCatalogTileTags=function(c){var s=c&&c.contentProvider;var l=this._getAdapter(s);if(typeof l.getCatalogTileTags==="function"){return l.getCatalogTileTags(c);}return[];};this.getCatalogTileKeywords=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTileKeywords(c);};this.getCatalogTilePreviewTitle=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTilePreviewTitle(c);};this.getCatalogTilePreviewInfo=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTilePreviewInfo(c);};this.getCatalogTilePreviewSubtitle=function(c){var s=c&&c.contentProvider;var l=this._getAdapter(s);if(l.getCatalogTilePreviewSubtitle){return l.getCatalogTilePreviewSubtitle(c);}};this.getCatalogTilePreviewIcon=function(c){var s=c&&c.contentProvider;return this._getAdapter(s).getCatalogTilePreviewIcon(c);};this.addBookmark=function(p,G){var P,d,m,s,t=this;if(!p.title){q.sap.log.error("Add Bookmark - Missing title");throw new Error("Title missing in bookmark configuration");}if(!p.url){q.sap.log.error("Add Bookmark - Missing URL");throw new Error("URL missing in bookmark configuration");}if(G&&this.isGroupLocked(G)){d=new q.Deferred();P=d.promise();m="Tile cannot be added, target group ("+this.getGroupTitle(G)+")is locked!";d.reject(m);q.sap.log.error(m);}else{s=G&&G.contentProvider;P=this._getAdapter(s).addBookmark(p,G);P.done(function(){t.changeURLStatesToPersistent(p.url);});P.fail(function(){q.sap.log.error("Fail to add bookmark for URL: "+p.url+" and Title: "+p.title);});}return P;};this.countBookmarks=function(u){if(!u||typeof u!=="string"){q.sap.log.error("Fail to count bookmarks. No valid URL");throw new Error("Missing URL");}var p=this._getAdapter().countBookmarks(u);p.fail(function(){q.sap.log.error("Fail to count bookmarks");});return p;};this.deleteBookmarks=function(u){var t=this;if(!u||typeof u!=="string"){throw new Error("Missing URL");}var p=this._getAdapter().deleteBookmarks(u);p.done(function(){t.deleteURLStatesPersistentData(u);});p.fail(function(){q.sap.log.error("Fail to delete bookmark for: "+u);});return p;};this.updateBookmarks=function(u,p){if(!u||typeof u!=="string"){q.sap.log.error("Fail to update bookmark. No valid URL");throw new Error("Missing URL");}if(!p||typeof p!=="object"){q.sap.log.error("Fail to update bookmark. No valid parameters, URL is: "+u);throw new Error("Missing parameters");}var P=this._getAdapter().updateBookmarks(u,p);P.fail(function(){q.sap.log.error("Fail to update bookmark for: "+u);});return P;};this.onCatalogTileAdded=function(s){return this._getAdapter().onCatalogTileAdded(s);};this.changeURLStatesToPersistent=function(u){var b=sap.ushell.Container.getService("AppState");var c=b.getPersistentWhenShared();if(b.getSupportedPersistencyMethods().length===0&&c!==true){return;}if(u&&u.length>0){try{var x=g(u,"sap-xapp-state"),i=g(u,"sap-iapp-state");if(x!==undefined){b.makeStatePersistent(x,A.PersonalState);}if(i!==undefined){b.makeStatePersistent(i,A.PersonalState);}}catch(e){q.sap.log.error("error in converting transiant state to personal persistent when bookmark is added",e,"sap.ushell.services.LaunchPage");}}};this.deleteURLStatesPersistentData=function(u){var b=sap.ushell.Container.getService("AppState");if(b.getSupportedPersistencyMethods().length===0){return;}if(u&&u.length>0){try{var x=g(u,"sap-xapp-state"),i=g(u,"sap-iapp-state");if(x!==undefined||i!==undefined){this.countBookmarks(u).done(function(c){if(c===0){if(x!==undefined){b.deleteAppState(x);}if(i!==undefined){b.deleteAppState(i);}}});}}catch(e){q.sap.log.error("error in deleting persistent state when bookmark is deleted",e,"sap.ushell.services.LaunchPage");}}};function g(u,p){var R=new RegExp("(?:"+p+"=)([^&/]+)"),s=R.exec(u),v=undefined;if(s&&s.length===2){v=s[1];}return v;}}L.prototype._getAdapter=function(a){return this.oAdapters[a]||this.oAdapters.default;};L.hasNoAdapter=false;return L;},true);
