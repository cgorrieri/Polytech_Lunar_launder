Quintus.LunarPanel = function(Q) {
  // Element qui permet de modifier l'affichage du panel
  Q.GameObject.extend("PanelState",{
    init: function(p) {
      this.p = Q._extend({},p);
      this.dom = {};
      this.listeners = {};
    },

    // Remet à zero toutes les valeurs des champs
    reset: function(p) { this.init(p); },
    
    // Définit la valeur d'un champs
    _setProperty: function(value,key) {
      if(!this.dom.hasOwnProperty(key))
        this.dom[key] = document.getElementById(key);
      this.dom[key].value = value;
    },

    // Definit la valeur de un ou plusieurs champs
    set: function(properties,value) {
      if(Q._isObject(properties)) {
        Q._each(properties,this._setProperty,this);
      } else {
        this._setProperty(value,properties);
      }
    },

    // Retourne la valeur du champ avec l'id property
    get: function(property) {
      return this.dom[property].value;
    },
    
    // Cache un sous panel
    hide: function(group_id) {
      document.getElementById(group_id).style.display="none";
    },
    
    // Affiche un sous panel
    show: function(group_id) {
      document.getElementById(group_id).style.display="block";
    }
  });

  return Q;
};
