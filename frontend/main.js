// Determine API base dynamically
const API_BASE = window.location.origin;

// Fetch books from backend API and display them
async function loadBooks() {
  const list = document.getElementById("bookList"); // your UL element
  if (!list) return; // safeguard

  list.innerHTML = "<li>Loading books...</li>";

  try {
    const res = await fetch(`${API_BASE}/api/books`);
    if (!res.ok) throw new Error(`https ${res.status}`);
    const books = await res.json();

    list.innerHTML = "";
    if (!books || books.length === 0) {
      list.innerHTML = "<li>No books found</li>";
      return;
    }

    books.forEach((book) => {
      const li = document.createElement("li");
      li.textContent = `${book.title} by ${book.author} (Recommended by: ${book.recommendedByName || "Unknown"})`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching books:", err);
    list.innerHTML = `<li style="color:red">Error loading books: ${err.message}</li>`;
  }
}

// Call the function on page load
loadBooks();
