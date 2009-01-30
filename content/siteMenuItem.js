SocialiteWindow.SiteMenuItem = (function() {
  let modules = {};
  let importModule = function(name) Components.utils.import(name, modules);
  
  let Socialite = importModule("resource://socialite/socialite.jsm").Socialite;
  let logger = importModule("resource://socialite/utils/log.jsm");
  let faviconWatch = importModule("resource://socialite/utils/faviconWatch.jsm");
  let domUtils = importModule("resource://socialite/utils/domUtils.jsm"); 
  
  var siteMenuItem = {
    SITE_MENUITEM_ID: "socialite-site-menuitem-",
    SITE_MENUITEM_CLASS: "socialite-site-menuitem",
    MENUITEM_CLASS: "socialite-menuitem",
    
    GENERAL_ICON: "chrome://socialite/content/socialite-small.png",
    GENERAL_MENUITEM_ID: "socialite-menuitem",
    
    onLoad: function() {
      this.generalItem = this.createGeneral();
      for (let [siteID, site] in Socialite.sites) {
        this.create(site);
      }
    },
    
    onUnload: function() {
      Array.forEach(this.getAll(), function(siteMenuItem) {
        if (siteMenuItem._removeFaviconWatch) { siteMenuItem._removeFaviconWatch(); }
      });
    },
    
    create: function(site) {
      let fileMenuPopup = document.getElementById("menu_FilePopup");
      let sendMenuItem = document.getElementById("menu_sendLink");
      let menuItem = document.createElement("menuitem");
      
      menuItem.id = this.SITE_MENUITEM_ID + site.siteID;
      menuItem.className = [this.SITE_MENUITEM_CLASS, this.MENUITEM_CLASS].join(" ");
      menuItem._removeFaviconWatch = faviconWatch.useFaviconAsAttribute(menuItem, "image", site.siteURL);
      
      menuItem.updateVisibility = function(visible, consolidated) {
        menuItem.setAttribute("hidden", !visible || consolidated);
      }
      menuItem.updateVisibility(
        Socialite.preferences.getBoolPref("showSiteMenuItems"),
        Socialite.preferences.getBoolPref("consolidateSites")
      );
      
      menuItem.addEventListener("command", function(event) {
        SocialiteWindow.linkContextAction(site, event, true);
      }, false);
      
      menuItem.updateSiteName = function(newSiteName) {
        menuItem.setAttribute("label", Socialite.stringBundle.formatStringFromName("shareMenuItem.label", [ newSiteName ], 1));
        
        let menuItems = siteMenuItem.getAll();
        if (menuItems.length == 0) {
          fileMenuPopup.insertBefore(menuItem, sendMenuItem.nextSibling);
        } else {
          domUtils.insertSorted(menuItem, menuItems, function(item1, item2) {
            let label1 = item1.getAttribute("label"); 
            let label2 = item2.getAttribute("label"); 
            return label1.localeCompare(label2);
          });
        }
      }
      menuItem.updateSiteName(site.siteName);
      
      return menuItem;
    },
    
    createGeneral: function() {
      let fileMenuPopup = document.getElementById("menu_FilePopup");
      let sendMenuItem = document.getElementById("menu_sendLink");
      let siteMenuItem = document.createElement("menuitem");
      
      siteMenuItem.id = this.GENERAL_MENUITEM_ID;
      siteMenuItem.className = this.MENUITEM_CLASS;
      siteMenuItem.setAttribute("src", SocialiteWindow.SiteUrlBarIcon.GENERAL_ICON);
      siteMenuItem.setAttribute("label", Socialite.stringBundle.GetStringFromName("generalMenuItem.label"));
      
      siteMenuItem.updateVisibility = function(visible, consolidated) {
        siteMenuItem.setAttribute("hidden", !visible || !consolidated);
      }
      siteMenuItem.updateVisibility(
        Socialite.preferences.getBoolPref("showSiteMenuItems"),
        Socialite.preferences.getBoolPref("consolidateSites")
      );
      
      siteMenuItem.addEventListener("command", function(event) {
        SocialiteWindow.linkContextAction(null, event, true);
      }, false);
      
      fileMenuPopup.insertBefore(siteMenuItem, sendMenuItem.nextSibling);
      
      return siteMenuItem;
    },
    
    get: function(site) {
      return document.getElementById(this.SITE_MENUITEM_ID + site.siteID);
    },
    
    getAll: function() {
      return document.getElementsByClassName(this.SITE_MENUITEM_CLASS);
    },
    
    remove: function(site) {
      let fileMenuPopup = document.getElementById("menu_FilePopup");
      let siteMenuItem = this.get(site);
      if (siteMenuItem._removeFaviconWatch) { siteMenuItem._removeFaviconWatch(); }
      fileMenuPopup.removeChild(siteMenuItem);
    },
    
    updateSiteName: function(site, siteName) {
      let siteMenuItem = this.get(site);
      siteMenuItem.updateSiteName(siteName);
    },
    
    updateVisibility: function() {
      let visible = Socialite.preferences.getBoolPref("showSiteMenuItems");
      let consolidated = Socialite.preferences.getBoolPref("consolidateSites");
      this.generalItem.updateVisibility(visible, consolidated);
      Array.forEach(this.getAll(), function(siteMenuItem) {
        siteMenuItem.updateVisibility(visible, consolidated);
      });
    }
  };
  
  return siteMenuItem;
})();