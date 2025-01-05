const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes?q=";
const RESULTS_PER_REQUEST = 40; // Maximum results per API request
const MAX_START_INDEX = 2000; // Pagination "hack"

// Prevent repetitive API calls
const themeBookCache = {};

// Fetch books from Google Books API
async function fetchBooks(query) {
  const startIndex = Math.floor(Math.random() * MAX_START_INDEX); // Randomize start index for broader results
  try {
    const response = await fetch(`${API_BASE_URL}${query}&maxResults=${RESULTS_PER_REQUEST}&startIndex=${startIndex}`);
    const data = await response.json();
    if (!data.items) return []; // Return empty array if no items found
    return data.items.map(item => ({
      title: item.volumeInfo.title || "No title available",
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown author",
      description: item.volumeInfo.description || "No description available",
      image: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null
    }));
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

// Display books dynamically
async function displayBooks(query, theme) {
 
  if (!themeBookCache[theme] || themeBookCache[theme].length === 0) {
    const books = await fetchBooks(query);
    themeBookCache[theme] = books; // Cache 
  }


  const books = themeBookCache[theme].splice(0, 6); // Remove them from the cache! Begone!

  const worksContainer = document.getElementById("works-container");
  worksContainer.innerHTML = ""; // Clear previous content

  if (books.length === 0) {
    worksContainer.innerHTML = `<p class="text-center text-secondary">Explore another theme to discover more books!</p>`;
    return;
  }

  books.forEach((book, index) => {
    const bookDiv = document.createElement("div");
    bookDiv.className = "col-md-4";
    bookDiv.innerHTML = `
      <div class="card h-100" onclick="showBookDetails(${index})" style="cursor: pointer;">
        ${book.image ? `<img src="${book.image}" class="card-img-top" alt="${book.title}">` : ""}
        <div class="card-body">
          <h5 class="card-title">${book.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
        </div>
      </div>
    `;
    worksContainer.appendChild(bookDiv);
  });

  // Store the displayed books 
  window.books = books;
}


function showBookDetails(index) {
  const book = window.books[index];
  document.getElementById("bookTitle").textContent = book.title;
  document.getElementById("bookAuthor").textContent = book.author;
  document.getElementById("bookContent").textContent = book.description;
  const bookModal = new bootstrap.Modal(document.getElementById("bookModal"));
  bookModal.show();
}


function filterWorks(theme) {
  let query = "Hispanic literature";
  if (theme === "identity") query += " identity culture";
  if (theme === "migration") query += " migration border";
  if (theme === "resistance") query += " resistance activism";
  displayBooks(query, theme);
}

// Initialize with default query
filterWorks("identity"); // Default to "identity" theme on load
