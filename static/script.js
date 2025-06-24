const API_URL = "http://127.0.0.1:5000/books";

async function fetchBooks() {
    const res = await fetch(API_URL, { credentials: 'include' });
    return await res.json();
}

async function addBookToLibrary(title, author, pages, read) {
    const newbook = { title, author, pages, read };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newbook)
    });
    updateTable(await fetchBooks());
}

async function deleteBookFromLibrary(index) {
    await fetch(`${API_URL}/${index}`, { method: 'DELETE', credentials: 'include' });
    updateTable(await fetchBooks());
}

async function updateBookStatus(index, read) {
    await fetch(`${API_URL}/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ read })
    });
    updateTable(await fetchBooks());
}

document.getElementById('btn').addEventListener('click', async () => {
    const titleInput = document.getElementById('name');
    const authorInput = document.getElementById('author');
    const pagesInput = document.getElementById('pages');
    const readInput = document.getElementById('READ');

    await addBookToLibrary(titleInput.value, authorInput.value, pagesInput.value, readInput.value);

    titleInput.value = '';
    authorInput.value = '';
    pagesInput.value = '';
    readInput.selectedIndex = 0;
});

function createTable(data){
    const table = document.createElement('table');
    const tabheader = table.insertRow();

    const header = ["Title", "Author", "Pages", "Status", " "];
    header.forEach(item => {
        const headerCell = document.createElement('th');
        headerCell.textContent = item;
        tabheader.appendChild(headerCell);
    });
    data.forEach((book, index) => {
        const row = table.insertRow();
        const fields = ['title', 'author', 'pages', 'read'];
        fields.forEach(key => {
            const cell = row.insertCell();
            if (key === 'read') {
                const select = document.createElement('select');
                const options = ['Read', 'Not read yet', 'Reading'];
                options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.textContent = option;
                    if (option === book[key]) opt.selected = true;
                    select.appendChild(opt);
                });
                function updateBackgroundColor(element, value) {
                    if (value === "Read") {
                        element.style.backgroundColor = "#baffae";
                    } else if (value === "Not read yet") {
                        element.style.backgroundColor = "#faadb0";
                    } else if (value === "Reading") {
                        element.style.backgroundColor = "#f5e0a1";
                    } else {
                        element.style.backgroundColor = "";
                    }
                }
                updateBackgroundColor(select, book[key]);
                select.addEventListener('change', async (e) => {
                    await updateBookStatus(index, e.target.value);
                });
                cell.appendChild(select);
            } else {
                cell.textContent = book[key];
            }
        });
        const deleteCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
<g fill="#ff0000" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8.53333,8.53333)"><path d="M15,3c-6.627,0 -12,5.373 -12,12c0,6.627 5.373,12 12,12c6.627,0 12,-5.373 12,-12c0,-6.627 -5.373,-12 -12,-12zM16.414,15c0,0 3.139,3.139 3.293,3.293c0.391,0.391 0.391,1.024 0,1.414c-0.391,0.391 -1.024,0.391 -1.414,0c-0.154,-0.153 -3.293,-3.293 -3.293,-3.293c0,0 -3.139,3.139 -3.293,3.293c-0.391,0.391 -1.024,0.391 -1.414,0c-0.391,-0.391 -0.391,-1.024 0,-1.414c0.153,-0.154 3.293,-3.293 3.293,-3.293c0,0 -3.139,-3.139 -3.293,-3.293c-0.391,-0.391 -0.391,-1.024 0,-1.414c0.391,-0.391 1.024,-0.391 1.414,0c0.154,0.153 3.293,3.293 3.293,3.293c0,0 3.139,-3.139 3.293,-3.293c0.391,-0.391 1.024,-0.391 1.414,0c0.391,0.391 0.391,1.024 0,1.414c-0.153,0.154 -3.293,3.293 -3.293,3.293z"></path></g></g>
</svg>`;
        deleteButton.addEventListener('click', async () => {
            await deleteBookFromLibrary(index);
        });
        deleteCell.appendChild(deleteButton);
    });
    return table;
}

function updateTable(data){
    const container = document.getElementById('book-container');
    container.innerHTML = '';
    container.appendChild(createTable(data));
}

async function checkLogin() {
    const res = await fetch(API_URL, { credentials: 'include' });
    if (res.status === 401) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

window.onload = async function() {
    if (await checkLogin()) {
        updateTable(await fetchBooks());
    }
};