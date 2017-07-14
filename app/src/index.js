const apiKey = require('./bookDB');
const bookDB = require('./bookDB.json');
const userBooksService = require('./userBooksService');
const favoriteBooks = userBooksService.loadSavedBooks();

function clearBooks() {
  document.getElementById('foundBooks').innerHTML = '';
}

function appendElement(parent, htmlText) {
  const el = document.createElement('template');
  el.innerHTML = htmlText;
  document.getElementById(parent).appendChild(el.content.firstElementChild);
}

function displayBooks(books, totalResults) {
  clearBooks();
  books.forEach(book => {
    if (book.author !== null && book.author !== undefined) {
      const template = `
          <div class="book" data-book-id="${book.id}">
            <p><strong>${book.name}</strong></p>
            <img src="../app/assets/${book.path}" />
            <p>
              <em>Price</em>: ${book.price}
            </p>
          </div>
        `;
      appendElement('foundBooks', template);
    }
  });
}

function bookNotFound() {
  clearBooks();
  const template = `<strong>The book you are looking for doesn not exist in our database.<strong>`;
  appendElement('foundBooks', template);
}

function processSearchResponse(response) {
  if (response.length > 0) {
    var searchedbooks = response;
    //Method to filter the book results.
    if ($("#search").val() !== "") {
      searchedbooks = response.filter(f => f.name === $("#search").val());
    }

    displayBooks(searchedbooks, searchedbooks.length);
  } else {
    bookNotFound();
  }
}

function processBookDetailsResponse(book) {
  //ISSUE: Function doing templating and serveral other things. So:
  //1. Makes it hard to read. Because the method is not declarative. 
  //   It is abstract, and not specific. So read code. 
  //2. Hidden dependencies. Hard to test and needs mocking. 

  const bookDetailTemplate = `
    <div class="book-detail" data-book-id="${book.id}">
      <p><strong>${book.name}</strong></p>
      <img src="../app/assets/${book.path}" />
      <p>
        <em>Price:</em> ${book.price}
      </p>
      <p>
        <em>Categories:</em>
        <ul>
          ${displayCategories(book.id, book.category)}
        </ul>
      </p>
      <p>
        <button class="btn-close">Close</button> 
        <button class="btn-favorite" data-book-name="${book.name}" data-book-id="${book.id}">Add to favorites</button>
      </p>
    </div>
  `;


  //ISSUE: Hidden Dependency: ASSUMES THE SCRIPT IS BEING RUN ON A BROWSER (accesing document).  
  if (document.getElementsByClassName('book-detail').length > 0) {
    document.getElementsByClassName('book-detail')[0].remove();
  }

  const el = document.createElement('template');
  el.innerHTML = bookDetailTemplate;
  document.body.appendChild(el.content.firstElementChild);
  $('.book-detail').animate({
    opacity: 1
  }, 300);
}

function displayCategories(id, categories) {
  let categoryList = '';
  categories.forEach(cat => categoryList += `<li>${cat}</li>`);
  return categoryList;
}

function displayFavoriteBooks() {
  document.getElementById('favorites').innerHTML = '';

  for (let bookId of Object.keys(favoriteBooks)) {
    appendElement('favorites', `<li><span>${favoriteBooks[bookId].name}</span> <a href="#" class="remove-favorite" data-book-id="${bookId}">Remove</a></li>`)
  }
}

$(document).on('click', '.book img, .book p', (e) => {
  e.preventDefault();
  var bookId = `${$(e.target).closest('.book').data('book-id')}`;
  $.getJSON('./src/bookDetails.json', response => {
    response = response.filter(book => book.id === bookId);
    processBookDetailsResponse(response[0]);
  });
});

$(document).on('click', 'button[type=submit]', (e) => {
  $.getJSON('./src/bookDB.json', response => {
    processSearchResponse(response);
  });
});

$(document).on('click', '.btn-close', function () {
  $(this).closest('div').animate({ opacity: 0 }, 300, function () {
    $(this).remove();
  });
});

$(document).on('click', '.btn-favorite', function () {
  const bookKey = $(this).data('book-id');
  if (!favoriteBooks[bookKey]) {
    const name = $(this).data('book-name');
    favoriteBooks[bookKey] = { name };
    userBooksService.addFavorite(bookKey, name);
    displayFavoriteBooks();
  }
  $(this).closest('div').animate({ opacity: 0 }, 300, function () {
    $(this).remove();
  });
});

$(document).on('click', '.remove-favorite', function (e) {
  e.preventDefault();
  const bookId = $(this).data('book-id');
  delete favoriteBooks[bookId];
  userBooksService.removeFavorite(bookId);
  displayFavoriteBooks();
});

window.onload = function () {
  displayFavoriteBooks();
}