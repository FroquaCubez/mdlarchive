let config;
const contentDiv = document.getElementById('content');
const overlay = document.getElementById('overlay');
const moduleImage = document.getElementById('module-image');
const pageSelect = document.getElementById('page-select');

let currentFolder = '';
let currentPage = 0;
let totalPages = 0;

async function loadConfig() {
    try {
        const response = await fetch('config.yml');
        const yamlText = await response.text();
        config = jsyaml.load(yamlText);
        console.log('Loaded config:', config); // Check if config is loaded
    } catch (error) {
        console.error('Error loading config:', error);
        contentDiv.innerHTML = '<p>Error loading configuration. Please try again later.</p>';
    }
}

async function init() {
    await loadConfig();
    showHome();
}

function showHome() {
    contentDiv.innerHTML = `
        <div class="home-content">
            <h2>Welcome to the Module Archive</h2>
            <p>Explore educational modules from Grade 1 to Grade 12. Our archive provides easy access to learning materials across various subjects and grade levels.</p>
            <button class="cta-button" onclick="showGrades()">Start Exploring</button>
        </div>
    `;
}

function showGrades() {
    contentDiv.innerHTML = '<h2>Select a Grade:</h2>';
    Object.keys(config.grades).forEach(grade => {
        const card = createCard(`Grade ${grade}`, () => showQuarters(grade), 'card');
        contentDiv.appendChild(card);
    });
}

function showQuarters(grade) {
    contentDiv.innerHTML = `<h2>Grade ${grade}: Select a Quarter:</h2>`;
    Object.keys(config.grades[grade]).forEach(quarter => {
        const card = createCard(`Quarter ${quarter.slice(1)}`, () => showSubjects(grade, quarter), 'card');
        contentDiv.appendChild(card);
    });
}

function showSubjects(grade, quarter) {
    console.log('Grade:', grade); // Check the grade passed
    console.log('Config:', config); // Check if config is defined
    
    const subjects = config.grades[grade][quarter]; // Access subjects for the specific quarter
    
    if (!subjects) {
        console.error('No subjects found for this grade and quarter:', grade, quarter);
        return; // Exit the function if subjects is null or undefined
    }
    
    contentDiv.innerHTML = `<h2>Grade ${grade}, Quarter ${quarter.slice(1)}: Select a Subject:</h2>`;
    Object.keys(subjects).forEach(subject => {
        const card = createCard(subject.toUpperCase(), () => showModules(grade, quarter, subject), 'card subject-card');
        contentDiv.appendChild(card);
    });
}

function showModules(grade, quarter, subject) {
    contentDiv.innerHTML = `<h2>${subject.toUpperCase()} Modules</h2>`;
    const modules = config.grades[grade][quarter][subject];
    if (Array.isArray(modules)) {
        modules.forEach(module => {
            const card = createCard(module, () => loadModulePages(grade, quarter, subject, module), 'card module-card');
            contentDiv.appendChild(card);
        });
    } else {
        Object.keys(modules).forEach(subSubject => {
            const subModules = modules[subSubject];
            subModules.forEach(module => {
                const card = createCard(`${subSubject.toUpperCase()}: ${module}`, () => loadModulePages(grade, quarter, `${subject}/${subSubject}`, module), 'card module-card');
                contentDiv.appendChild(card);
            });
        });
    }
}

function loadModulePages(grade, quarter, subject, module) {
    currentFolder = `modules/grade${grade}/${quarter}/${subject}/${module}`;
    currentPage = 0;
    totalPages = 40; // Assuming 40 pages per module, you might want to adjust this or make it dynamic
    displayPage();
    overlay.classList.remove('hidden');
}

function displayPage() {
    const pageNumber = String(currentPage).padStart(3, '0');
    moduleImage.src = `${currentFolder}/${pageNumber}.png`;
    moduleImage.onerror = handleImageError;
    updatePageSelector();
}

function updatePageSelector() {
    pageSelect.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Page ${i + 1}`;
        option.selected = i === currentPage;
        pageSelect.appendChild(option);
    }
}

function handleImageError() {
    moduleImage.src = 'placeholder.png';
    alert('Image not found. Please check the folder structure or filenames.');
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        displayPage();
    }
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        displayPage();
    }
}

function jumpToPage(page) {
    currentPage = parseInt(page);
    displayPage();
}

function closeViewer() {
    overlay.classList.add('hidden');
}

function createCard(title, onClick, className) {
    const card = document.createElement('div');
    card.className = className;
    card.innerText = title;
    card.onclick = onClick;
    return card;
}

init();
