Quintus.LunarPanel = function(Q) {
  // Element qui permet de modifier l'affichage du panel
  Q.GameObject.extend("PanelState",{
    init: function(p) {
      this.p = Q._extend({},p);
      this.dom = {};
      this.listeners = {};
    },

    // Resets the state to value p
    reset: function(p) { this.init(p); },
    
    // Internal helper method to set an individual property
    _setProperty: function(value,key) {
      if(!this.dom.hasOwnProperty(key))
        this.dom[key] = document.getElementById(key);
      this.dom[key].value = value;
    },

    // Set one or more properties, trigger events on those
    // properties changing
    set: function(properties,value) {
      if(Q._isObject(properties)) {
        Q._each(properties,this._setProperty,this);
      } else {
        this._setProperty(value,properties);
      }
    },

    // Return an individual property
    get: function(property) {
      return this.p[property];
    }
    
    // hide a group in the panel
    hide: function(group_id) {
      document.getElementById(group_id).style.display="none";
    }
    
    // show a group in the panel
    show: function(group_id) {
      document.getElementById(group_id).style.display="block";
    }
  });

  return Q;
};
