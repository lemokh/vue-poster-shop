new Vue({
  el: "#app",
  data: {
    total: 0,
    products: [],
    cart: [],
    search: "cat",
    lastSearch: ""
  },
  methods: {
    addToCart: function(product) {
      this.total += product.price;
      let found = false;
      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i].id) {
          this.cart[i].qty++;
          found = true;
        }
      }
      if (!found) {
        this.cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          qty: 1
        });
      }
    },
    inc: function(item) {
      // console.log("inc");
      item.qty++;
      this.total += item.price;
    },
    dec: function(item) {
      // console.log("dec");
      item.qty--;
      this.total -= item.price;
      if (item.qty <= 0) {
        let i = this.cart.indexOf(item);
        this.cart.splice(i, 1);
      }
    },
    onSubmit: function() {
      // vue-response
      // console.log("Search");
      this.products = [];
      this.loading = true;
      let path = "/search?q=".concat(this.search);
      this.$http.get(path).then(function(response) {
        // console.log(response);
        this.products = response.body;
        this.lastSearch = this.search;
        this.loading = false;
      });
    }
  },
  filters: {
    currency: function(price) {
      return "$".concat(price.toFixed(2));
    }
  },
  created: function() {
    this.onSubmit();
  }
});
