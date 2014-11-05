import Ember from 'ember';
import ProductFetcher from '../../services/product_fetcher';

export default Ember.Route.extend({
  queryParams: {
    categories: { refreshModel: true },
    keywords: { refreshModel: true },
    priceMin: { refreshModel: true },
    priceMax: { refreshModel: true },
    orderBy: { refreshModel: true },
    orderType: { refreshModel: true },
    latitude: { refreshModel: true },
    longitude: { refreshModel: true },
  },

  model: function(_, transition) {
    return this.get('store').all('product');
  },

  productFetcher: function() {
    this._productFetcher = this._productFetcher || ProductFetcher.create({store: this.get('store')});
    return this._productFetcher;
  }.property(),


  beforeModel: function(transition) {
    var fetcher = this.get('productFetcher');
    var queryParams = transition.queryParams;
    var filters = {
      categories: queryParams.categories && queryParams.categories.split(","),
      keywords: queryParams.keywords,
      price: {min: queryParams.priceMin, max: queryParams.priceMax},
      geolocation: {latitude: queryParams.latitude, longitude: queryParams.longitude}
    };

    this.set('filters', filters);
    this.get('store').unloadAll('product');

    return fetcher.products(null, filters);
  },

  actions: {
    loadMore: function() {
      var start = this.get('controller.length');

      if (!this.get('controller.loadingMore')) {
        this.set('controller.loadingMore', true);
        this.get('productFetcher').products(start, this.get('filters')).then(function(records) {
          this.set('controller.loadingMore', false);
        }.bind(this));
      }
    }
  }
});
