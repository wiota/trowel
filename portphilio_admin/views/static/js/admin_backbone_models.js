/* ------------------------------------------------------------------- */
// Portphillio Admin Backbone Models
/* ------------------------------------------------------------------- */

App.Model = {};

/* ------------------------------------------------------------------- */
// App Model Overrides
/* ------------------------------------------------------------------- */

Backbone.Model.prototype.parse = function(response){
  if(response.result)
  return response.result;
};

Backbone.Model.prototype.idAttribute = "_id";

/* ------------------------------------------------------------------- */
// Vertex - Abstract class - do not instantiate!
/* ------------------------------------------------------------------- */

App.Model['Vertex'] = App.Vertex = Backbone.Model.extend({

  initialize: function(options){
    options = options || {};
    this.fetched = options.fetched || false;
    this.deep = options.deep || false;

    this.set({'_cls': this._cls});

    this.on('change', this.triggerEvents);
  },

  triggerEvents: function(model, options){
    var attr = model.changedAttributes()
    var summary_attr = _.omit(attr, 'succset');

    if(!_.isEmpty(summary_attr)){
      this.trigger('summaryChanged', {'attr':summary_attr});
    }

    msg.log("CHANGE Model ['"+_.keys(attr).join("', '") + "']", 'model');
  },

  isFetched: function(){
    return this.fetched;
  },

  isDeep: function(){
    return this.deep;
  },

  parse: function(response){
    if(response.result){
      response.result.succset = this.reference(response.result.succset);
      return response.result;
    }

  },

  deepen: function(){
    msg.log("GET "+ this.url(), 'lookup');
    this.fetch({
      success: this.deepenSuccess,
      error: this.deepenError
    });
    return this;
  },

  deepenSuccess: function(model, response, options){
    msg.log("FETCH SUCCESS " + model.get("_id") + " " + model.get("title"),'lookup');
    var collection = App.collection[model.get('_cls')];

    collection.add(model);

    model.fetched = true;
    model.deep = true;

    // referencing done already in parse function
    // model.set(model.reference(model.get('succset')));
  },

  deepenError: function(model, response, options){
    console.log("Fetch unsucessful " + response);
  },

  reference: function(succset){
    var succsetReferences = [];
    _.each(succset, function(object){
      var collection = App.collection[object._cls];
      var modelFactory = App.Model[object._cls];
      var model = collection.get(object['_id']) || new modelFactory(object, {'fetched': true, 'deep': false});

      collection.add(model);
      succsetReferences.push(model);
    });
    return succsetReferences;
  },

  outOfSync: function(){
    this.fetched = false;
    this.trigger('outofsync');
    this.once('sync', this.resynced);
    this.deepen();
  },

  resynced: function(){
    this.trigger('resynced');
  },

  saveSuccset: function(){
    var list = this.get('succset');

    var options = {
      'url': this.url() + '/succset/',
      'contentType' : "application/json",
      'data': JSON.stringify({'succset' : _.pluck(list, 'id')})
    }

    Backbone.sync('update', this, options)
  }


});

/* ------------------------------------------------------------------- */
// Category
/* ------------------------------------------------------------------- */

App.Model['Vertex.Category'] = App.Category = App.Vertex.extend({
  urlRoot: "api/v1/category/",
  _cls: "Vertex.Category"
});

/* ------------------------------------------------------------------- */
// Work
/* ------------------------------------------------------------------- */

App.Model['Vertex.Work'] = App.Work = App.Vertex.extend({
  urlRoot: "api/v1/work/",
  _cls: "Vertex.Work"
});

/* ------------------------------------------------------------------- */
// Tag
/* ------------------------------------------------------------------- */

App.Model['Vertex.Tag'] = App.Tag = Backbone.Model.extend({
  urlRoot: "api/v1/tag/",
  _cls: "Vertex.Tag"
});

/* ------------------------------------------------------------------- */
// Medium - Abstract class - do not instantiate!
/* ------------------------------------------------------------------- */

App.Model['Vertex.Medium'] = App.Medium = App.Vertex.extend({
  _cls: "Vertex.Medium",

  initialize: function(){
    this.formUrl = null;
    this.set({'_cls': this._cls});
    this.fetched = false;
    this.deep = false;
  }
});

/* ------------------------------------------------------------------- */
// Photo
/* ------------------------------------------------------------------- */


App.Model['Vertex.Medium.Photo'] = App.Photo = App.Medium.extend({
  urlRoot: "api/v1/photo/",
  _cls: "Vertex.Medium.Photo"
});

/* ------------------------------------------------------------------- */
// Body or Portfolio
/* ------------------------------------------------------------------- */

App.Model['Vertex.Body'] = App.Portfolio = App.Vertex.extend({
  urlRoot: "api/v1/body/",
  _cls: "Vertex.Body",

  url: function(){
    return this.urlRoot;
  }

});