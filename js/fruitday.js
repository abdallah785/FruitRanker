// ============================================
// FRUIT DU JOUR
// ============================================
const FruitDay = {
  getFruitOfDay() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % FRUITS.length;
    return FRUITS[index];
  },

  render() {
    const fruit = this.getFruitOfDay();
    return '<div class="fruit-day-card">' +
      '<div class="fruit-day-badge">🌟 Fruit du jour</div>' +
      '<div class="fruit-day-content">' +
        '<img src="' + fruit.image + '" alt="' + fruit.name + '" class="fruit-day-img" onerror="this.style.display=\'none\'">' +
        '<div class="fruit-day-info">' +
          '<h3>' + fruit.emoji + ' ' + fruit.name + '</h3>' +
          '<p class="fruit-day-benefits">' + fruit.benefits + '</p>' +
          '<span class="fruit-day-category">' + fruit.category + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
};
