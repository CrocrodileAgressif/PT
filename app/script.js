const USERNAME = "CrocrodileAgressif";
const REPO_NAME = "PT";

const reposContainer = document.getElementById("repos");

// GitHub Pages URL
const PAGES_URL = `https://${USERNAME}.github.io/${REPO_NAME}`;

// ========================================
// LOAD FILES FROM GITHUB REPOSITORY
// ========================================

// File in the repository root containing relative paths to ignore.
// One path per line. Empty lines and lines beginning with # are ignored.
//
// Examples:
// MATHS/Cours
// MATHS/Cours/old.pdf
// README.md
//
// A path matching a file is ignored.
// A path matching a directory also ignores everything inside it.
const IGNORE_FILE = ".ignore";

async function getIgnorePaths() {
	const url = `https://raw.githubusercontent.com/${USERNAME}/${REPO_NAME}/HEAD/${IGNORE_FILE}`;

	try {
		const response = await fetch(url);

		// The ignore file is optional.
		// If it does not exist, simply ignore nothing.
		if (!response.ok) {
			if (response.status === 404) {
				return [];
			}

			throw new Error("Could not load the ignore file.");
		}

		const content = await response.text();

		return content
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"))
			.map((path) => path.replace(/^\.\/+/, "").replace(/\/+$/, ""));
	} catch (error) {
		console.warn(`Could not read ${IGNORE_FILE}.`, error);
		return [];
	}
}

function isIgnoredPath(filePath, ignorePaths) {
	const normalizedPath = filePath
		.replace(/^\.\/+/, "")
		.replace(/^\/+|\/+$/g, "");

	return ignorePaths.some((ignorePath) => {
		if (!ignorePath) {
			return false;
		}

		// Exact match = ignored file or directory itself.
		if (normalizedPath === ignorePath) {
			return true;
		}

		// Prefix match = everything inside an ignored directory.
		return normalizedPath.startsWith(ignorePath + "/");
	});
}

async function getRepositoryFiles() {
	const response = await fetch(
		`https://api.github.com/repos/${USERNAME}/${REPO_NAME}/git/trees/HEAD?recursive=1`,
	);

	if (!response.ok) {
		throw new Error("Could not load repository.");
	}

	const data = await response.json();

	// Read the ignore file before building the tree.
	const ignorePaths = await getIgnorePaths();

	return data.tree
		.filter((item) => item.type === "blob")
		.filter((item) => !isIgnoredPath(item.path, ignorePaths));
}

// ========================================
// BUILD FOLDER TREE
// ========================================

function buildTree(files) {
	const root = {
		folders: {},
		files: [],
	};

	files.forEach((file) => {
		const parts = file.path.split("/");

		let current = root;

		parts.forEach((part, index) => {
			const isFile = index === parts.length - 1;

			if (isFile) {
				current.files.push({
					name: part,
					path: file.path,
				});
			} else {
				if (!current.folders[part]) {
					current.folders[part] = {
						folders: {},
						files: [],
					};
				}

				current = current.folders[part];
			}
		});
	});

	return root;
}

// ========================================
// CREATE FOLDER TREE
// ========================================

function createTreeElement(tree, isRoot = false) {
	const container = document.createElement("div");

	container.className = "folder-content";

	// ========================================
	// FOLDERS
	// ========================================

	Object.keys(tree.folders)
		.sort((a, b) => a.localeCompare(b))
		.forEach((folderName) => {
			const folder = tree.folders[folderName];

			const folderWrapper = document.createElement("div");

			folderWrapper.className = "folder";

			// Folder header
			const folderHeader = document.createElement("div");

			folderHeader.className = "folder-header";

			// Toggle button
			const toggleButton = document.createElement("button");

			toggleButton.className = "folder-toggle";

			toggleButton.textContent = "▶";

			// Folder name
			const folderNameElement = document.createElement("span");

			folderNameElement.className = "folder-name";

			folderNameElement.textContent = "📁 " + folderName;

			folderHeader.appendChild(toggleButton);
			folderHeader.appendChild(folderNameElement);

			// Folder contents
			const folderContents = createTreeElement(folder, false);

			folderContents.classList.add("hidden");

			// Toggle folder
			function toggleFolder() {
				const isHidden = folderContents.classList.contains("hidden");

				folderContents.classList.toggle("hidden");

				toggleButton.textContent = isHidden ? "▼" : "▶";
			}

			toggleButton.addEventListener("click", toggleFolder);

			folderNameElement.addEventListener("click", toggleFolder);

			folderWrapper.appendChild(folderHeader);
			folderWrapper.appendChild(folderContents);

			container.appendChild(folderWrapper);
		});

	// ========================================
	// FILES
	// ========================================

	// Root files are displayed too.
	tree.files
		.sort((a, b) => a.name.localeCompare(b.name))
		.forEach((file) => {
			const fileElement = document.createElement("div");

			fileElement.className = "file";

			// File name
			const fileName = document.createElement("span");

			fileName.className = "file-name";

			fileName.textContent = "📄 " + file.name;

			// Buttons container
			const buttons = document.createElement("div");

			buttons.className = "file-buttons";

			// ========================================
			// OPEN URL
			// ========================================

			// This uses GitHub Pages
			// Example:
			// https://tonioliii.github.io/PT/MATHS/Cours/ch1(an1).pdf

			const openURL = `${PAGES_URL}/${file.path
				.split("/")
				.map((part) => encodeURIComponent(part))
				.join("/")}`;

			// ========================================
			// DOWNLOAD URL
			// ========================================

			const downloadURL = `https://raw.githubusercontent.com/${USERNAME}/${REPO_NAME}/HEAD/${file.path}`;

			// ========================================
			// OPEN BUTTON
			// ========================================

			const openButton = document.createElement("a");

			openButton.className = "open";

			openButton.textContent = "Open";

			openButton.href = openURL;

			openButton.target = "_blank";

			openButton.rel = "noopener noreferrer";

			// ========================================
			// DOWNLOAD BUTTON
			// ========================================

			const downloadButton = document.createElement("a");

			downloadButton.className = "download";

			downloadButton.textContent = "Download";

			downloadButton.href = downloadURL;

			downloadButton.download = file.name;

			downloadButton.rel = "noopener noreferrer";

			// ========================================
			// ADD BUTTONS
			// ========================================

			buttons.appendChild(openButton);
			buttons.appendChild(downloadButton);

			// Add file name + buttons
			fileElement.appendChild(fileName);
			fileElement.appendChild(buttons);

			container.appendChild(fileElement);
		});

	return container;
}

// ========================================
// LOAD REPOSITORY
// ========================================

async function loadRepository() {
	try {
		reposContainer.innerHTML = '<div class="loading">Loading files...</div>';

		const files = await getRepositoryFiles();

		const tree = buildTree(files);

		reposContainer.innerHTML = "";

		// Repository title
		const repositoryTitle = document.createElement("h2");

		repositoryTitle.textContent = "📦 " + REPO_NAME;

		reposContainer.appendChild(repositoryTitle);

		// Root files are displayed too.
		const treeElement = createTreeElement(tree, true);

		reposContainer.appendChild(treeElement);
	} catch (error) {
		console.error(error);

		reposContainer.innerHTML = `
            <div class="error">
                Failed to load repository files.
                <br><br>
                Check your GitHub username,
                repository name, and GitHub Pages settings.
            </div>
        `;
	}
}

// ========================================
// START
// ========================================

loadRepository();
