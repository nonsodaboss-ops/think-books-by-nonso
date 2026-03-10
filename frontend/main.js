// Fetch books from backend API and display them
async function loadBooks() {
  try {
    const res = await fetch('/api/books'); // relative path works with the server
    const books = await res.json();

    const list = document.getElementById('bookList');
    list.innerHTML = '';
    books.forEach(book => {
      const li = document.createElement('li');
      li.textContent = `${book.title} by ${book.author}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching books:', err);
  }
}

loadBooks();