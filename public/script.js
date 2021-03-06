var PRICE = 9.99;
var LOAD_NUM = 10;

// pusher key is first argument
var pusher = new Pusher("9ad7d2c2a34996446ef0", {
  cluster: "ap2",
  encrypted: true
});

new Vue({
  el: "#app",
  data: {
    total: 0,
    items: [],
    results: [],
    cart: [],
    newSearch: "anime",
    lastSearch: "",
    loading: false,
    price: PRICE,
    pusherUpdate: false
  },
  mounted: function() {
    this.onSubmit();
    var elem = document.getElementById("product-list-bottom");
    var watcher = scrollMonitor.create(elem);
    var vue = this;
    watcher.enterViewport(function() {
      vue.appendItems();
    });
    var channel = pusher.subscribe("cart");
    channel.bind("update", function(data) {
      // sets a flag to prevent any updates from occurring if
      // the cart data was changed as a result of the pusher update
      vue.pusherUpdate = true;
      vue.cart = data;
      vue.total = 0;
      for (var i = 0; i < vue.cart.length; i++) {
        vue.total += PRICE * vue.cart[i].qty;
      }
    });
  },
  filters: {
    currency: function(price) {
      return "$".concat(price.toFixed(2));
    }
  },
  computed: {
    noMoreItems: function() {
      return (
        this.results.length === this.items.length && this.results.length > 0
      );
    }
  },
  watch: {
    cart: {
      handler: function(val) {
        if (!this.pusherUpdate) {
          // if cart changes but not due to a pusher update,
          // do the ajax call
          this.$http.post("/cart_update", val);
        } else {
          // otherwise set the flag to false
          this.pusherUpdate = false;
        }
      },
      deep: true
    }
  },
  methods: {
    appendItems: function() {
      if (this.items.length < this.results.length) {
        var append = this.results.slice(
          this.items.length,
          this.items.length + LOAD_NUM
        );
        this.items = this.items.concat(append);
      }
    },
    onSubmit: function() {
      if (this.newSearch.length) {
        this.lastSearch = this.newSearch;
        this.loading = true;
        this.items = [];
        this.results = [];
        this.$http.get("/search/".concat(this.newSearch)).then(function(res) {
          this.loading = false;
          this.results = res.data;
          this.appendItems();
        });
      }
    },
    addItem: function(index) {
      var item = this.items[index];
      var found = false;
      for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i].id === item.id) {
          this.cart[i].qty++;
          found = true;
        }
      }
      if (!found) {
        this.cart = this.cart.concat({
          id: item.id,
          title: item.title,
          qty: 1,
          price: PRICE
        });
      }
      this.total += PRICE;
    },
    inc: function(item) {
      item.qty++;
      this.total += PRICE;
    },
    dec: function(item) {
      item.qty--;
      this.total -= PRICE;
      if (item.qty <= 0) {
        for (var i = 0; i < this.cart.length; i++) {
          if (this.cart[i].id === item.id) {
            this.cart.splice(i, 1);
            break;
          }
        }
      }
    }
  }
});
