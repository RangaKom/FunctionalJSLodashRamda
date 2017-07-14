'use strict';

const FAVORITE_BOOKS = 'favoriteBooks';

function saveFavorites(favorites) {
  localStorage[FAVORITE_BOOKS] = JSON.stringify(favorites);
}

function loadSavedBooks() {
  const data = localStorage[FAVORITE_BOOKS] || '{}';
  return JSON.parse(data);
}

function removeFavorite(id) {
  let favorites = this.loadSavedBooks();
  delete favorites[id];
  this.saveFavorites(favorites);
}

function addFavorite(id, name) {
  let favorites = this.loadSavedBooks();
  favorites[id] = favorites[id] || { name, id };
  
  this.saveFavorites(favorites);
}


module.exports = {
  loadSavedBooks,
  removeFavorite,
  addFavorite,
  saveFavorites
}