/*
***************************************************
* panel.js                                        *
*     Panneau de l'animation                      *
*                                                 *
* Auteurs :                                       *
*   Lo�c FAIZANT, Cyril GORRIERI, Maurice RAMBERT *
*                                                 *
* Ecole Polytech' Nice Sophia Antipolis           *
* Sciences Informatiques - 4e ann�e               *
***************************************************
*/

// D�finir le panneau de l'animation
Quintus.Panel = function(Q) {
  Q.GameObject.extend("LeftPanel",{
    // Initialiser le panneau de l'animation
    init: function(p) {
      this.groups = new Array();
      this.id = p.id;
      // Obtenir les sous-panneaux
      var searchEles = document.getElementById(p.id).children;
      for(var i = 0; i < searchEles.length; i++) {
          if(searchEles[i].tagName == 'DIV') {
              this.groups.push(searchEles[i].id);
          }
      }
    },

    // D�finir la remise � z�ro du panneau
    reset: function(p) { this.init(p); },
    
    // D�finir les accesseurs de consultation sur les �l�ments
    get: function(key) {
      return document.getElementById(key).value;
    },
    
    getRadio: function(key) {
      var radios = document.getElementsByName(key);

      for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
      }
    },
    
    // D�finir les accesseurs de modification des �l�ments
    _setProperty: function(value, key) {
        document.getElementById(key).value = value;
    },

    set: function(properties, value) {
      // Contr�ler la multiplicit� des propri�t�s � modifier
      if(Q._isObject(properties)) {
        Q._each(properties,this._setProperty,this);
      } else {
        this._setProperty(value,properties);
      }
    },
    
    // D�finir le non-affichage du panneau
    hide: function() {
      this.hideEl(this.id);
    },
    
    // D�finir l'affichage du panneau
    show: function() {
      this.showEl(this.id);
    },
    
    // D�finir le non-affichage d'un �l�ment
    hideEl: function(el) {
      document.getElementById(el).style.display="none";
    },
    
    // D�finir l'affichage d'un �l�ment
    showEl: function(el) {
      document.getElementById(el).style.display="block";
    },
    
    // D�finir le non-affichage d'un groupe d'�l�ments
    hideGroup: function(groups) {
      // Contr�ler la multiplicit� des �l�ments � masquer
      if(groups instanceof Array) {
        Q._each(groups,this.hideEl,this);
      } else {
        this.hideEl(groups);
      }
    },
    
    // D�finir le non-affichage de tous les �l�ments
    hideAll: function() {
       Q._each(this.groups,this.hideEl,this);
    },
    
    // D�finir l'affichage d'un groupe d'�l�ments
    showGroup: function(groups) {
      // Contr�ler la multiplicit� des �l�ments � masquer
      if(groups instanceof Array) {
        Q._each(groups,this.showEl,this);
      } else {
        this.showEl(groups);
      }
    }
  });

  return Q;
};
